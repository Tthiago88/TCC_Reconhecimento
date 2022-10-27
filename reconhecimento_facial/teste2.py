from datetime import datetime
from multiprocessing.resource_sharer import stop
from nturl2path import pathname2url
from pickle import TRUE
from re import X
from tokenize import String
from PIL import Image
from PIL import ImageChops
from os import listdir, path
import face_recognition as fr
import cv2
import cv2 as cv
import collections
from conexão_bd import inserir_presença,inserir_dados

import face_recognition

def reconhece_face(url_foto):
    foto = fr.load_image_file(url_foto)
    rostos = fr.face_encodings(foto) #analisar essa linha
    if(len(rostos) > 0):
        return True, rostos
    
    return False, []

path2 = path.dirname(path.realpath(__file__)) + "/SI7P13" #pega nome fotos da pasta seleciona e salva em Files
files_rosto = [f for f in listdir(path2)]
print(files_rosto)
path = path.dirname(path.realpath(__file__)) + "/img" #pega nome fotos da pasta seleciona e salva em Files
files = [f for f in listdir(path)]
print(files) 

#def get_rostos():
  #  rostos_conhecidos = []
  #  nomes_reconhecidos = []

   # return rostos_conhecidos, nomes_reconhecidos
rosto_desconhecido =[]
nomes_reconhecidos = []
nome_alunos= []
presente=[]
faltas= []

def main(args):
# Carrega o arquivo jpg em um array numpy
    for file in files:
        image = face_recognition.load_image_file(f"C:/Users/Davi/Documents/reconhecimento_facial/img/{file}")
        #imageCinza = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        # Encontra as faces na imagem usando o modelo default HOG.
        face_locations = face_recognition.face_locations(image)
        print("Encontrei {} face(s) nesta foto.".format(len(face_locations)))
        #mostra a imagem original
        pil_image_original = Image.fromarray(image)
        #pil_image_original.show()

        #mostra a face obtida
        for face_location in face_locations:
            # Mostra a posição de cada face
            top, right, bottom, left = face_location
            print("Uma face é localizada na posição Topo: {}, Esquerda: {}, Fundo: {}, Direita: {}".format(top, left, bottom, right))
            face_image = image[top:bottom, left:right]# posição do rosto da foto
            imageCinza = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
            #pil_image = Image.fromarray(face_image)
            #cv2.imshow("Fatia da imagem", face_image)
            cv2.imwrite("C:/Users/Davi/Documents/reconhecimento_facial/Face_Image.png", imageCinza)
            #pil_image.show() 
            #pega foto de cada rosto
            for file in files_rosto:
                image_rosto = reconhece_face(f"C:/Users/Davi/Documents/reconhecimento_facial/SI7P13/{file}")
                #imageCinza_rosto = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                if (image_rosto[0]):
                    rostos_conhecidos=image_rosto[1][0]
                else:
                    print("Erro##01")
                
                def chamada():
                    data_atual= datetime.now().strftime("%Y/%m/%d")
                    turma="SI7P13"
                    for z in range(len(files_rosto)):
                        if (nome_alunos.count(files_rosto[z][:-4])>=1):
                            qtd=nome_alunos.count(files_rosto[z][:-4])
                            print('{} apareceu {} vezes'.format(files_rosto[z][:-4],qtd))
                            if qtd>=1: #calculo presença
                                nome=files_rosto[z][:-4]
                                presente.append(nome)
                                inserir_presença(data_atual,turma,nome)# inserir no banco de Dados

                            else:
                                faltas.append(files_rosto[z][:-4])
                        else:
                            z=z+1
                
                def teste():
                    for z in range(len(resultados)):
                        if(str(resultados[z])=='True'):
                            nome=(f'{file}')
                            nomes_reconhecidos.append(nome[:-4])
                            nome_alunos.append(nome[:-4])
                            print("Rosto do", nomes_reconhecidos[0], "foi reconhecido")
                            nomes_reconhecidos.clear()
                            resultados.clear()
                            return 0
                            break 
                        else:
                            print("Rosto não reconehcido")
                            z=z+1

                image_desconhecido = reconhece_face("C:/Users/Davi/Documents/reconhecimento_facial/Face_Image.png")
                #desconhecido = image
                if (image_desconhecido[0]):
                    rosto_desconhecido.append(image_desconhecido[1][0])
                    #rostos_conhecidos, nomes_reconhecidos = get_rostos() 
                    resultados = fr.compare_faces(rostos_conhecidos, rosto_desconhecido)
                    #print(resultados)
                    nomes_reconhecidos.clear()
                    rosto_desconhecido.clear()
                    #rostos_conhecidos.clear()
                    if teste() == 0:
                        break      
                else:
                    print("Erro##02")

                
                                   

                '''for z in range(len(resultados)):
                    if(str(resultados[z])=="True"):
                        nomes_reconhecidos.append(f'{file}')
                        print("Rosto do", nomes_reconhecidos[0], "foi reconhecido")
                        nomes_reconhecidos.clear()
                        break
                    else:
                        z=z+1
                else:
                    print("Nao foi encontrado nenhum rosto")'''
    
    #data_atual= datetime.now().strftime("%Y/%m/%d")
    #turma="SI7P13"
    #inserir_dados(data_atual,turma)
    chamada()
    print('alunos com presença:\n {}'.format(presente))
    print('alunos com falta :\n {}'.format(faltas))
    
    return 0

if __name__ == '__main__':
    import sys
    sys.exit(main(sys.argv)) 

                    #else:
                        #print("Nao foi encontrado nenhum rosto")
'''
                        for i in range(len(rostos_conhecidos)):
                            resultado = resultados[i]
                            if(resultado):
                                print("Rosto do", nomes_reconhecidos[i], "foi reconhecido")
                            else:
                                print("rosto desconhecido")  
'''

                        #if resultados== "True":
                         #   nomes_reconhecidos.append(f'{file}')
                          #  for i in range(len(rostos_conhecidos)):
                           #     resultado = resultados[i]
                            #    if(resultado):
                             #       print("Rosto do", nomes_reconhecidos[i], "foi reconhecido")
                              #      resultados.clear()
                            #break
                        #else:
                         #   print('ND')


                        #print(resultados)
                        #if resultados[1] == True:
                         #   nomes_reconhecidos.append(f'{file}')
                        #else:
                         #   print("rosto desconhecido")
                        

                       # for i in range(len(rostos_conhecidos)):
                        #    resultado = resultados[i]
                         #   if(resultado):
                          #      print("Rosto do", nomes_reconhecidos[i], "foi reconhecido")
                    
           # else:
            #    print("Nao foi encontrado nenhum rosto")
                    #imageCinza_rosto = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

                    # Mostra a face separadamente:
                    #pil_image = Image.fromarray(face_image)
                    #pil_image.show() 
'''
return 0

if __name__ == '__main__':
    import sys
    sys.exit(main(sys.argv))
'''