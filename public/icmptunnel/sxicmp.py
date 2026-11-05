
'''============================================================================
|
| Project description: An ICMP Tunneling client program.
|     Used for implementing a reliable file transfer over ICMP protocol,
|     when payload is being scrambled.
| By Baruch Mustakis (a.k.a. ShoobyD)
|
============================================================================'''

from icmp_tunnel import *
import time

if __name__ == "__main__":

	# 3-way handshake: sniff for a file request.
	while True:
		feedback = sniff( TIMEOUT )
		if ERROR == feedback: continue
		data, addr = feedback
		data = disasPackage( data )
		if ERROR == data: continue
		if FILE_REQ_MESSAGE == data[1]:
			break

	setDestAddr( addr[0] )
	startTime = time.time()
	# send req-ack and wait for auto-ack sent by client's system.
	SendAndExpect( REQ_ACK_MESSAGE, "", TIMEOUT )

	# create tunnel server service and start asynchronous communication.
	TunnelServer()
	asyncore.loop( 0 )

	# send close ack.
	SendAndExpect( FIN_ACK_MESSAGE, "", TIMEOUT )

	#print "took only", time.time()-startTime, "seconds"


#=====#
# EOF #
#=====#

