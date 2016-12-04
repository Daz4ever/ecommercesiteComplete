#!/usr/bin/python

import sys
import logging
import os

logging.basicConfig(stream=sys.stderr)
path = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, path)
#the name server below is the name of your server.py file
#if not, modify the name

from server import app as application
