
'''============================================================================
|
| Project description: An ICMP Tunneling server program.
|     Used for implementing a reliable file transfer over ICMP protocol,
|     when payload is being scrambled.
| By Baruch Mustakis (a.k.a. ShoobyD)
|
============================================================================'''

from icmp_tunnel import *

if __name__ == "__main__":

	# 3-way handshake: ask for file, and wait for req-ack. third ack auto-sent by system.
	SendAndExpect( FILE_REQ_MESSAGE, REQ_ACK_MESSAGE, TIMEOUT )

	# create tunnel server service and start asynchronous communication.
	TunnelClient()
	asyncore.loop( 0 )

	# send close request.
	SendAndExpect( FIN_MESSAGE, FIN_ACK_MESSAGE, TIMEOUT )


#=====#
# EOF #
#=====#

