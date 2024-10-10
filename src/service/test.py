import numpy as np


def multiple(a, b):
    return np.multiply(a, b).tolist()

def hello_world():
    return "Hello, World!"


import math
# Calculate the square root of a number
def square_root(number):
    return math.sqrt(float(number))

import json
def convertTextToJson(text):
    result = json.loads(text)
    
    # Print some user information
    print(f"value is: {result['key']}")

if __name__ == "__main__":
    convertTextToJson('{"key": "hello"}')