# FrqTester_Gong_CASC

## Resumen del Proyecto

El objetivo general de este proyecto es desarrollar una instalación sonora que permite hacer resonar un Chau Gong Weiss de 38" de forma completamente electrónica y sin contacto físico.

En lugar de utilizar percusión mecánica tradicional, el sistema funciona como un "mazo electromagnético". Utiliza un amplificador de audio y una bobina hecha a medida para disparar ondas magnéticas precisas a través del aire. Al chocar con la aleación de bronce del instrumento, estos campos invisibles generan corrientes internas que obligan al metal masivo a vibrar por pura física de repulsión (ya que la inducción electromagnética solo repele).

En resumen: este patch permite tomar un instrumento acústico de gran formato y "tocarlo" a distancia mediante campos magnéticos controlados por señales de audio, transformándolo en un resonador dinámico para explorar y amplificar sus armónicos naturales.

## Funcionamiento y Estimulación

Para conocer los armónicos naturales del gong, se utiliza previamente un espectrómetro. 
Posteriormente, este patch se encarga de estimular el sistema de inducción a **la mitad** de las frecuencias resonantes obtenidas del espectrómetro. 

**¿Por qué a la mitad?** Dado que la inducción electromagnética solo aleja (repele), durante un ciclo completo de la onda generada, el gong recibe dos empujones. El gong percibe esto como dos ciclos (es decir, el gong "ve" la onda como si estuviera rectificada). Por lo tanto, estimulando a la mitad de la frecuencia objetivo, se logra excitar la resonancia en la frecuencia real deseada.

## Tipos de Onda

El patch permite seleccionar entre tres tipos de ondas, todas ellas con un **ancho de pulso controlable**. El control del ancho de pulso es fundamental para darle al gong momentos de retroceso sin repulsión (tiempos muertos), permitiendo que el metal tenga tiempo de volver a su posición de reposo antes del próximo empujón magnético.

Los tres tipos de onda disponibles son:

1. **Square (Cuadrada):** Genera pulsos magnéticos secos y abruptos.
2. **Sine (Senoidal):** Una onda suave, pero que no amortigua su llegada a cero (al tiempo muerto). La caída es abrupta cuando se recorta el ancho de pulso. Se convierte en una senoidal pura cuando su ancho de pulso es completo (100%).
3. **Sine Damp (Senoidal Amortiguada):** A diferencia de la "Sine", esta onda sí amortigua su llegada al tiempo muerto (cero). Pensando en que el gong percibe la onda como rectificada, esta forma de onda permite entregarle un empujón senoidal más natural, suavizando la transición hacia el tiempo muerto.

### Notas Adicionales:
* Se ha encontrado de forma empírica que, con frecuencias por encima de los **100 Hz**, la onda senoidal completa (ancho de pulso completo) funciona bien y responde de forma adecuada.
