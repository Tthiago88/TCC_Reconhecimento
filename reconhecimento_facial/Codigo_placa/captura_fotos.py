import pygame, sys
import pygame.camera
import time
 
WEBCAM_DIR = "/home/sala/Documentos/img"

pygame.init()
pygame.camera.init()
cam = pygame.camera.Camera("/dev/video1", (2560,1440))
cam.start()
# pega foto da webcam
for x in range(4): #quantidade de fotos a ser tirada
    image = cam.get_image()

    timestamp = time.strftime("%d-%m-%Y_%H-%M-%S", time.localtime())
    filename = "/%s/%s.jpg" % (WEBCAM_DIR, timestamp)
    
    # salvar imagem
    pygame.image.save(image, filename)
    
    print ("Salvo")
    if x!=4:
        time.sleep(5)
    else:
        cam.stop
        break       

