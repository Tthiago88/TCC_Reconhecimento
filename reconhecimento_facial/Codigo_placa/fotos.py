import pygame, sys
import pygame.camera
import time

WEBCAM_DIR = "/home/sala/Documentos/img"
    
pygame.init()
pygame.camera.init()
cam = pygame.camera.Camera("/dev/video1", (800,600))
cam.start()
    # pega foto da webcam
while(True):
    if time.strftime("%H:%M:%S")=="19:10:00" or time.strftime("%H:%M:%S")=="20:45:05":
        for x in range(12): #quantidade de fotos a ser tirada
            image = cam.get_image()

            timestamp = time.strftime("%d-%m-%Y_%H-%M-%S", time.localtime())
            filename = "%s/%s.jpg" % (WEBCAM_DIR, timestamp)
                
            # salvar imagem
            pygame.image.save(image, filename)
                
            print ("Salvo")
            if x!=12:
                time.sleep(375)
            else:
                break    
                     