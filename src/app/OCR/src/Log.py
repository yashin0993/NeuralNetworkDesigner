import os
from datetime import datetime

version = "1.0.1"

class Log:
    def __init__(self):
        self.f = None
        self.path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "OCR.log")
    
    def Open(self):
        if self.f == None:
            if os.path.exists(self.path):
                os.remove(self.path)

            self.f = open(self.path, "a")
        else:
            print("file stream already opened.")

    def WriteTitle(self, programName):
        self.f.write("-------------------------------------------------------------")
        self.f.write("\n\tProgram   : " + programName)
        self.f.write("\n\tVersion   : " + version)
        self.f.write("\n\tExec time : " + datetime.now().strftime("%Y/%m/%d %H:%M:%S"))
        self.f.write("\n-------------------------------------------------------------\n")

    def WriteLog(self, message):
        time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.f.write("[" + time + "]\t" + message + "\n")

    def Close(self):
        if not self.f == None:
            self.f.close()
            print("stream closed")
