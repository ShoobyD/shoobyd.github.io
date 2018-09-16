
'''============================================================================
|
| Project description: An ICMP Tunneling module.
|     Used for implementing a reliable file transfer over ICMP protocol,
|     when payload is being scrambled.
| By Baruch Mustakis (a.k.a. ShoobyD)
|
============================================================================'''

# importing modules.
import sys
import socket
import asyncore
import select
import struct
import time
import array
#import binascii


#===========#
# constants #
#===========#
SRC_IP_ADDR = "0.0.0.0"
PORT = 0 # a dummy port (icmp doesn't use ports).

DEST_IP_ADDR = ""
if 2 == len(sys.argv):
	DEST_IP_ADDR = sys.argv[1]

# for setting DEST_IP_ADDR from outside.
def setDestAddr( addr ):
	global DEST_IP_ADDR
	DEST_IP_ADDR = addr

ERROR = -1
TIMEOUT = 2
ACK_DELAY = 0.2
BUFF_SIZE = 2048
THRESHOLD = 256

# an arbitrary id num for identifying 'ICMP Tunneling' module messages.
MY_ID_NUM = 24102 # = 0x5e26 = chksum("Baruch HaShakel")


#==================#
# control messages #
#==================#
FILE_REQ_MESSAGE = "CAN I HAS FILE"
REQ_ACK_MESSAGE = "OK GET DIS"
ACK_MESSAGE = "ACK"
FIN_MESSAGE = "KTHXBYE"
FIN_ACK_MESSAGE = "LOL CYA"



def SendAndExpect( send_msg, exp_msg, timeout ):
	''' Sends send_msg and waits for exp_msg.
		In case of timeout, starts over. '''
	# create tmp socket.
	sock = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_ICMP)
	# include IP header manually.
	sock.setsockopt(socket.IPPROTO_IP, socket.IP_HDRINCL, 1)
	sock.connect( (DEST_IP_ADDR, PORT) )
	sock.settimeout( timeout )

	# create packet.
	packet = createPacket( send_msg, 0 )
	if ERROR == packet:
		return ERROR

	gotAnswer = False
	while not gotAnswer:
		# send message.
		sock.send( packet )
		start_time = time.time()
		# sniff expected message.
		while True:
			if gotAnswer or (time.time() - start_time) > timeout:
				break
			try: recvdata = sock.recv( BUFF_SIZE )
			except: recvdata = ERROR
			# if not timed-out, check if received message is expected one.
			if ERROR == recvdata: continue
			recvdata = disasPackage( recvdata )
			if ERROR == recvdata: continue
			gotAnswer = ( recvdata[1] == exp_msg ) and ( recvdata[2] == 0 )
	# close socket.
	sock.close()


def createPacket( data, seq_num ):
	''' Creates packet string with received info.
		data goes inside option field in IP header, and seq_num
		goes inside sequence number field in ICMP header. '''

	if len(data) > 38:
		#print "ERROR: data too long"
		return ERROR

	# set data for IP header option field.
	if data != "":
		data = "\x95" + chr(len(data)+2) + data
		data = data + "\x00"*(-len(data)%4)

	# create packet.
	iphead = IPv4Header( data )
	icmphead = ICMPv4Header( seq_num )
	return iphead.build_head() + icmphead.build_head() 


def disasPackage( raw_pkt ):
	''' Disassemles raw packet, returns tuple of icmp type, data from
		IP header option field, and sequence number.
		Also checks for errors. '''

	# extract IP header.
	head_len = struct.unpack("!B", raw_pkt[0])[0] & 0xf
	iphead = raw_pkt[:head_len*4]

	# check IP header's checksum.
	chk = struct.unpack("H", iphead[10:12])[0]
	iphead = iphead[:10] + "\x00\x00" + iphead[12:]
	if chk != chksum(iphead):
		#print "ERROR: IP chksum fail"
		return ERROR

	# disassemble ICMP header.
	icmphead = raw_pkt[head_len*4:]
	type, code, chk = struct.unpack("BBH", icmphead[:4])
	id_num, seq_num = struct.unpack("!HH", icmphead[4:])

	# check ICMP header's checksum.
	icmphead = icmphead[:2] + "\x00\x00" + icmphead[4:]
	if chk != chksum(icmphead):
		#print "ERROR: icmp chksum fail"
		return ERROR

	# check if it's an 'ICMP Tunneling module' message.
	if id_num != MY_ID_NUM:
		#print "NOT MINE"
		return ERROR

	# extract data from packet.
	data = iphead[20:]
	if data != "":
		data_len = ord( data[1] )
		data = data[2:data_len]

	return type, data, seq_num


def sniff( timeout ):
	''' Packet sniffer. '''
	recvsock = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_ICMP)
	# receive packets with IP header.
	recvsock.setsockopt(socket.IPPROTO_IP, socket.IP_HDRINCL, 1)
	recv = select.select([recvsock], [], [], timeout)[0]
	if recv: # if available for reading.
		recvdata = recv[0].recvfrom( BUFF_SIZE )
		recv[0].close()
		return recvdata
	return ERROR


def chksum(str):
	''' Checksum function. '''
	if len(str) & 1:
		str = str + '\0'
	words = array.array('h', str)
	sum = 0
	for word in words:
		sum = sum + (word & 0xffff)
	hi = sum >> 16
	lo = sum & 0xffff
	sum = hi + lo
	sum = sum + (sum >> 16)
	return (~sum) & 0xffff


class IPv4Header:
	''' IPv4 Header class.
		build_head method returns string of the header.
		Checksum and Total Length are always filled in automatically.
		Source Address and Packet Id filled in when zero. '''

	def __init__(self , opt=""):
		# header fields.
		self.ver = 4
		self.head_len = 5 + len(opt)/4
		self.TOS = 0
		self.total_len = 0 # 20 + len(opt) + 8
		self.ID = 0
		self.flags_offset = (2<<13) # Don't Fragment bit set ON.
		self.TTL = 128
		self.protocol= 1 # ICMP protocol number.
		self.checksum = 0
		self.src_addr = SRC_IP_ADDR
		self.dest_addr = DEST_IP_ADDR
		self.opt = opt

	def build_head(self):
		self.packet = ""
		verlen = (self.ver<<4) + self.head_len
		self.packet += struct.pack("!BBH", verlen, self.TOS, self.total_len)
		self.packet += struct.pack("!HH", self.ID, self.flags_offset)
		self.packet += struct.pack("!BBH", self.TTL, self.protocol, self.checksum)
		self.packet += socket.inet_aton(self.src_addr)
		self.packet += socket.inet_aton(self.dest_addr)
		self.packet += self.opt
		return self.packet


class ICMPv4Header:
	''' ICMPv4 Header class, for echo requests.
		build_head method returns string of the header. '''

	def __init__(self, seq_num = 0):
		# header fields.
		self.type = 8 # echo request.
		self.code = 0
		self.checksum = 0
		self.ID = MY_ID_NUM
		self.seq_num = seq_num

	def build_head(self):
		type_code = struct.pack("!BB", self.type, self.code)
		id_seqnum = struct.pack("!HH", self.ID, self.seq_num)
		# calculating checksum.
		self.checksum = chksum( type_code + "\x00\x00" + id_seqnum )
		return type_code + struct.pack("H", self.checksum) + id_seqnum




class TunnelServer(asyncore.dispatcher):
	''' ICMP Tunneling Server class, for asynchronous communication handling.
		Using asyncore module. '''

	def __init__(self):
		asyncore.dispatcher.__init__(self)
		self.create_socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_ICMP)

		# load file to file_buffer.
		self.read_file() 

		# variables.
		self.curr_segment = 1 # current segment to be delivered.
		self.waiting_for = 1 # what client is waiting for.
		self.was_last_sent = False # was last segment sent.
		self.pkts_on_chan = 0 # number of packets on channel.
		self.window = 2 # window size = max pkts on chan.
		self.threshold = THRESHOLD # slow-start threshold.
		self.dup_acks = 0 # duplicate ack counter.
		self.restarted = False # was congestion state restarted.
		self.time_sent = time.time() # timer.
		self.timer_set = False # timer flag.


	def create_socket(self, family, type, proto):
		''' Overwriting original 'asyncore.py' method for protocol support. '''
		self.family_and_type = family, type # has no usage.
		sock = socket.socket(family, type, proto)
		# include IP header manually.
		sock.setsockopt(socket.IPPROTO_IP, socket.IP_HDRINCL, 1)
		sock.connect( (DEST_IP_ADDR, PORT) )
		sock.setblocking(0)
		self.set_socket(sock)


	def read_file(self):
		''' Loads file to memory, divided into 38 bytes segments.
			Stores data in 'file_buffer' list. '''
		self.file_buffer = [""] # dummy segment for seqnum 0.
		while True:
			segment = sys.stdin.read(38)
			self.file_buffer.append( segment )
			if len( segment ) < 38: break # end of file.
		self.last_segment = len( self.file_buffer ) - 1 # index of last segment.


	def send_segment(self, seq_num):
		''' Sends segment seq_num. '''
		data = self.file_buffer[seq_num]
		packet = createPacket( data, seq_num )
		if ERROR == packet: return
		bytes_sent = self.send( packet )
		#print "\bsending packet #"+str(seq_num)+".. (total:", bytes_sent, "bytes)"
		self.pkts_on_chan += 1
		# set timer, if not already set.
		if not self.timer_set:
			self.time_sent = time.time()
			self.timer_set = True
		if seq_num == self.last_segment:
			#print "LAST PACKET"
			self.was_last_sent = True


	def timed_out(self):
		''' TimeOut handler. '''
		#print "TIMEDOUT"
		self.timer_set = False
		self.restart()
		self.curr_segment = self.waiting_for
		self.window = 1
		#print "re-",
		self.send_segment( self.waiting_for )


	def restart(self):
		''' Restarts congestion info. '''
		#print "RESTARTING"
		self.restarted = True
		self.dup_acks = 0
		self.was_last_sent = False
		self.pkts_on_chan = 0
		self.threshold = self.window / 2


	def writable(self):
		''' Returns writability state. '''
		if ( time.time() - self.time_sent ) > TIMEOUT:
			self.timed_out()
			return False
		if self.pkts_on_chan < self.window:
			# continue normally until last segment was sent.
			if not self.was_last_sent: return True
			return self.curr_segment != self.last_segment
		return False


	def handle_write(self):
		''' Writing packets handler. '''
		#print "\n", self.pkts_on_chan, "pkts on chan, window:", self.window,\
			#"current segment:", self.curr_segment
		seq_num = max(self.curr_segment, self.waiting_for)
		self.send_segment( self.curr_segment )
		# promote curr_segment (if not last).
		if seq_num != self.last_segment: self.curr_segment = seq_num + 1


	def handle_read(self):
		''' Reading packets handler. '''

		# read new packet and disassemble it.
		raw_pkt = self.recv( BUFF_SIZE )
		feedback = disasPackage( raw_pkt )
		if ERROR == feedback: return
		type, data, seq_num = feedback

		# client got last packet -> close socket.
		if FIN_MESSAGE == data: self.close()

		#print "\nreading new pkt - dup:", self.dup_acks, "sq:", seq_num,\
			#"last waited for:", self.waiting_for
		# ignore acks for packets already received by client.
		if seq_num < self.waiting_for: return

		# my ack message = a req for seq_num segment.
		if ACK_MESSAGE == data:
			#print "mein ack"
			self.restarted = False
			if seq_num == self.waiting_for:
				self.dup_acks += 1
				#print "re-req", self.dup_acks
				if 3 < self.dup_acks:
					self.restart()
					self.window = max( 1, self.threshold ) + 3
					#print "re-",
					self.send_segment( seq_num )
					return
			else: self.dup_acks = 0
			# all previous segments were received.
			self.waiting_for = seq_num

		else: # system echo reply, seq_num packet received.
			# if progression restarted, wait for my ack.
			if self.restarted: return

		# update congestion info.
		self.pkts_on_chan = max( 0, self.pkts_on_chan - 1 )
		if self.window < self.threshold: self.window += 1
		else: self.window += 1/self.window
		self.time_sent = time.time() # set timer.



class TunnelClient(asyncore.dispatcher):
	''' ICMP Tunneling Client class, for asynchronous communication handling.
		Using asyncore module. '''

	def __init__(self):
		asyncore.dispatcher.__init__(self)
		self.create_socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_ICMP)
		self.file_buffer = {} # file buffer is a dictionary.
		self.waiting_for = 1 # what packet we are waiting for.
		self.last_segment = -1 # last segment index.
		self.got_msg = False # got message flag.
		self.time_sent = time.time() # timer for ack delaying.


	def create_socket(self, family, type, proto):
		''' Overwriting original 'asyncore.py' method for protocol support. '''
		self.family_and_type = family, type # has no usage.
		sock = socket.socket(family, type, proto)
		# include IP header manually.
		sock.setsockopt(socket.IPPROTO_IP, socket.IP_HDRINCL, 1)
		sock.connect( (DEST_IP_ADDR, PORT) )
		sock.setblocking(0)
		self.set_socket(sock)


	def writable(self):
		''' Returns writability state. '''
		# return True if got message and ack delaying time passed.
		return self.got_msg and ( time.time() - self.time_sent ) > ACK_DELAY


	def handle_write(self):
		''' Writing packets handler, requests next segment. '''
		packet = createPacket( ACK_MESSAGE, self.waiting_for )
		if ERROR == packet: return
		self.send( packet )
		#print "req #"+str(self.waiting_for)
		self.got_msg = False
		self.time_sent = time.time() # set timer.


	def handle_read(self):
		''' Reading packets handler. '''

		# read new packet and disassemble it.
		raw_pkt = self.recv( BUFF_SIZE )
		feedback = disasPackage( raw_pkt )
		if ERROR == feedback: return
		type, data, seq_num = feedback

		# if not echo req, or it's a control message (handshake).
		if type != 8 or seq_num < 1: return
		#print "\nreading new pkt - sq:", seq_num, "wait for:", self.waiting_for

		if seq_num not in self.file_buffer.keys():
			# save segment if it's not in buffer.
			self.file_buffer[seq_num] = data
		if len(data)<38: self.last_segment = seq_num # last segment of file.

		# promote 'waiting_for' to next non-received segment index.
		while self.waiting_for in self.file_buffer.keys():
			self.waiting_for += 1
		# if what we are waiting for is after last segment.
		if self.waiting_for == self.last_segment + 1:
			#print "GOT LAST (total:", len(self.file_buffer.keys()), "pkts)"
			self.write_file()
		self.got_msg = True
		#self.time_sent = time.time()


	def write_file(self):
		''' Writes file to disc and closes socket. '''
		for i in range(1, self.waiting_for):
			sys.stdout.write(self.file_buffer[i])
			pass
		self.close()


#=====#
# EOF #
#=====#

