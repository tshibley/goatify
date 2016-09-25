import json
import boto
from boto.sqs.message import Message
import time
from pprint import pprint
import os, sys, getopt, glob, random, re, subprocess
import tempfile
from boto.s3.key import Key
from pydub import AudioSegment
import tinys3
import shutil


def to_audio(sf2, midi_file, out_dir, out_type='wav'):
    """ 
    Convert a single midi file to an audio file.  
    
    Args:
        sf2 (str):        the file path for a .sf2 soundfont file
        midi_file (str):  the file path for the .mid midi file to convert
        out_dir (str):    the directory path for where to write the audio out
        out_type (str):   the output audio type (see 'fluidsynth -T help' for options)
    """
    fbase = os.path.splitext(os.path.basename(midi_file))[0]
    out_file = out_dir + '/' + fbase + '.' + out_type

    subprocess.call(['fluidsynth', '-T', out_type, '-F', out_file, '-ni', sf2, midi_file])

def processMessage(message): 

	s3 = boto.connect_s3(host='s3-us-west-2.amazonaws.com')
	data = json.loads(message.get_body())

	s3Bucket = data['Records'][0]['s3']['bucket']['name']
	fileName = data['Records'][0]['s3']['object']['key']
	fileNameArr = fileName.split('.')

	print "Bucket: " + s3Bucket + "    FileName: " +  fileName

	tempDir = tempfile.mkdtemp() + "/"

	print tempDir

	midibucket = s3.get_bucket(s3Bucket)
	key = midibucket.get_key(fileName)
	key.get_contents_to_filename(tempDir + fileName)

	to_audio("./goat.sf2", tempDir + fileName, tempDir)
	AudioSegment.from_file(tempDir + fileNameArr[0] + '.wav').export(tempDir + fileNameArr[0] + ".mp3", format="mp3")

	conn = tinys3.Connection(aws_access_key_id,aws_secret_access_key, tls=True, endpoint='s3-us-west-2.amazonaws.com')
	f = open(tempDir + fileNameArr[0] + '.mp3','rb')
	conn.upload(fileNameArr[0] + '.mp3',f, 'goatmp3bucket')

	shutil.rmtree(tempDir); 

	print "done processing"

s3 = boto.connect_s3()
conn = boto.sqs.connect_to_region("us-west-2")
queue = conn.get_queue('goatifyMIDI')
print "midi to Goat started, listening for files"

while 1: 
	messages = queue.get_messages()
	for message in messages:
		processMessage(message)
		queue.delete_message(message)
	time.sleep(0.5)

