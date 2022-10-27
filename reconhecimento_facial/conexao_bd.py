import mysql.connector
from mysql.connector import Error

def inserir_presença(data,turma,presença):
    try:
        con=mysql.connector.connect(host='localhost',database='teste',user='root',password='12345')

        inserir_presença="""INSERT INTO chamada (DATA,TURMA,RA_PRESENTE) VALUES("{}","{}","{}")""".format(data,turma,presença)

        cursor=con.cursor()
        cursor.execute(inserir_presença)
        con.commit()
        print(cursor.rowcount,"registros inseridos na tabela!")
        cursor.close()
    except Error as erro:
        print("Falha ao inserir dados:{}".format(erro))
    finally:
        if(con.is_connected()):
            con.close()
            print("Conexão encerrada")
'''
def inserir_falta(falta):
    try:
        con=mysql.connector.connect(host='localhost',database='teste',user='root',password='12345')

        inserir_falta="""INSERT INTO chamada (RA_FALTA) VALUES("{}")""".format(falta)

        cursor=con.cursor()
        cursor.execute(inserir_falta)
        con.commit()
        print(cursor.rowcount,"registros inseridos na tabela!")
        cursor.close()
    except Error as erro:
        print("Falha ao inserir dados:{}".format(erro))
    finally:
        if(con.is_connected()):
            con.close()
            print("Conexão encerrada")
'''

def inserir_dados(data,turma):
    try:
        con=mysql.connector.connect(host='localhost',database='teste',user='root',password='12345')

        inserir_dados="""INSERT INTO chamada (DATA,TURMA) VALUES("{}","{}")""".format(data,turma)

        cursor=con.cursor()
        cursor.execute(inserir_dados)
        con.commit()
        print(cursor.rowcount,"registros inseridos na tabela!")
        cursor.close()
    except Error as erro:
        print("Falha ao inserir dados:{}".format(erro))
    finally:
        if(con.is_connected()):
            con.close()
            print("Conexão encerrada")
