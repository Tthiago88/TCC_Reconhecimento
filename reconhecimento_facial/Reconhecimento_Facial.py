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
from conexão_bd import inserir_presença
import os

import face_recognition

def reconhece_face(url_foto):
    foto = fr.load_image_file(url_foto)
    rostos = fr.face_encodings(foto) #analisar essa linha
    if(len(rostos) > 0):
        return True, rostos
    
    return False, []

path2 = path.dirname(path.realpath(__file__)) + "/SI8P13" #pega nome fotos da pasta seleciona e salva em Files
files_rosto = [f for f in listdir(path2)]
print(files_rosto)
path = path.dirname('Z:/img/img') #pega nome fotos da pasta seleciona e salva em Files
files = [f for f in listdir(path)]
print(files) 


rosto_desconhecido =[]
nomes_reconhecidos = []
nome_alunos= []
presente=[]
faltas= []

turma="SI8P13"
disciplina=3
presenca=1

def main(args):
# Carrega o arquivo jpg em um array numpy
    for file in files:
        image = face_recognition.load_image_file(f"z:/img/{file}")
        #imageCinza = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Encontra as faces na imagem usando o modelo default HOG.
        face_locations = face_recognition.face_locations(image)
        print("Encontrei {} face(s) nesta foto.".format(len(face_locations)))

        #mostra a imagem original
        pil_image_original = Image.fromarray(image)
        

        #mostra a face obtida
        for face_location in face_locations:
            # Mostra a posição de cada face
            top, right, bottom, left = face_location
            print("Uma face é localizada na posição Topo: {}, Esquerda: {}, Fundo: {}, Direita: {}".format(top, left, bottom, right))
            face_image = image[top:bottom, left:right]# posição do rosto da foto
            imageCinza = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
            #pil_image = Image.fromarray(face_image)
            #cv2.imshow("Fatia da imagem", face_image)
            cv2.imwrite("C:/Users/Thiago/Desktop/Projeto_TCC/reconhecimento_facial/Face_Image.png", imageCinza)
            
            #pega foto de cada rosto
            for file in files_rosto:
                image_rosto = reconhece_face(f"C:/Users/Thiago/Desktop/Projeto_TCC/reconhecimento_facial/SI8P13/{file}")
                #imageCinza_rosto = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                if (image_rosto[0]):
                    rostos_conhecidos=image_rosto[1][0]
                else:
                    print("Erro##01")
                
                def chamada():
                    data_atual= datetime.now().strftime("%Y/%m/%d")

                    #inseri foto de toda sala na pasta
                    image = face_recognition.load_image_file(f"z:/img/{files[0]}")
                    imageCinza = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                    cv2.imwrite(f"C:/Users/Thiago/Desktop/Projeto_TCC/reconhecimento_facial/fotos_sala/{files[3]}", imageCinza)
                    
                    for z in range(len(files_rosto)):
                        if (nome_alunos.count(files_rosto[z][:-4])>=1):
                            qtd=nome_alunos.count(files_rosto[z][:-4])
                            print('{} apareceu {} vezes'.format(files_rosto[z][:-4],qtd))
                            if qtd>=3: #calculo presença
                                nome=files_rosto[z][:-4]
                                presente.append(nome)
                                inserir_presença(nome,disciplina,data_atual,turma,presenca)# inserir no banco de Dados

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

                image_desconhecido = reconhece_face("C:/Users/Thiago/Desktop/Projeto_TCC/reconhecimento_facial/Face_Image.png")
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