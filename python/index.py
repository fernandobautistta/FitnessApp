import cv2
import mediapipe as mp
import numpy as np
mp_dibujo = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

captura = cv2.VideoCapture(0)

contador = 0
stage = None

with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
    while captura.isOpened():
        ret, frame = captura.read()
        
        imagen = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        imagen.flags.writeable = False
      
        resultados = pose.process(imagen)
    
        imagen.flags.writeable = True
        imagen = cv2.cvtColor(imagen, cv2.COLOR_RGB2BGR)
        
        try:
            referencia = resultados.pose_landmarks.landmark
            
            referencia[mp_pose.PoseLandmark.LEFT_SHOULDER.value].visibility
            referencia[mp_pose.PoseLandmark.LEFT_ELBOW.value]
            referencia[mp_pose.PoseLandmark.LEFT_WRIST.value]
            
            for reference in mp_pose.PoseLandmark:
                print(reference)
                    
            referencia[mp_pose.PoseLandmark.LEFT_SHOULDER.value].visibility
            referencia[mp_pose.PoseLandmark.LEFT_ELBOW.value]
            referencia[mp_pose.PoseLandmark.LEFT_WRIST.value]
            
            def calcular_angulo(a,b,c):
                a = np.array(a) # Primer
                b = np.array(b) # Medio
                c = np.array(c) # Final

                radianes = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
                angulo = np.abs(radianes*180.0/np.pi)

                if angulo >180.0:
                    angulo = 360-angulo
        
                return angulo
            
            
            hombro_izq = [referencia[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,referencia[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
            codo_izq = [referencia[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,referencia[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
            muñeca_izq = [referencia[mp_pose.PoseLandmark.LEFT_WRIST.value].x,referencia[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
            
            hombro_der = [referencia[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,referencia[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
            codo_der = [referencia[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,referencia[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
            muñeca_der = [referencia[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,referencia[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]
            
            hombro_der,codo_der,muñeca_der
            hombro_izq,codo_izq,muñeca_izq
            
            angulo_izq = calcular_angulo(hombro_izq, codo_izq, muñeca_izq)
            angulo_der = calcular_angulo(hombro_der, codo_der, muñeca_der)
            
            tuple(np.multiply(codo_izq, [640, 480]).astype(int))
            tuple(np.multiply(codo_der, [640, 480]).astype(int))
            
            cv2.putText(imagen, str(angulo_izq), 
                           tuple(np.multiply(codo_izq, [640, 480]).astype(int)), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA
                                )
            
            cv2.putText(imagen, str(angulo_der), 
                           tuple(np.multiply(codo_der, [640, 480]).astype(int)), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA
                                )
            
            if angulo_der > 160 and angulo_izq > 160:
                stage = "abajo"
            if (angulo_der < 30 and angulo_izq < 30) and stage == 'abajo':
                stage = 'arriba'
                contador+=1
                print(contador)     
                       
        except:
            pass
            
        cv2.rectangle(imagen,(0,0),(225,73),(245,117,16),-1)
        
        cv2.putText(imagen, 'REPS', (15,12), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,0), 1, cv2.LINE_AA)
        cv2.putText(imagen, str(contador), 
                    (10,60), 
                    cv2.FONT_HERSHEY_SIMPLEX, 2, (255,255,255), 2, cv2.LINE_AA)
        
        cv2.putText(imagen, 'STAGE', (65,12), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,0), 1, cv2.LINE_AA)
        cv2.putText(imagen, stage, 
                    (60,60), 
                    cv2.FONT_HERSHEY_SIMPLEX, 2, (255,255,255), 2, cv2.LINE_AA)
        
        mp_dibujo.draw_landmarks(imagen, resultados.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                mp_dibujo.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2), 
                                mp_dibujo.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2) 
                                 )               
        
        cv2.imshow('Ejercicios', imagen)

        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

    captura.release()
    cv2.destroyAllWindows()