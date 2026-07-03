# Coil Designer - Guía Rápida para Principiantes

¡Bienvenido al **Coil Designer** (Diseñador de Bobinas)! Esta calculadora es tu asistente personal para diseñar un "motor magnético" (una bobina hecha de alambre de cobre) que tiene un solo propósito: empujar y hacer vibrar un gong de bronce sin siquiera tocarlo, usando fuerza magnética pura.

No te preocupes si términos como "ohmios", "amperios" o "flujo magnético" te suenan en chino. Esta guía te explicará para qué sirve cada palanca y botón en la pantalla de la forma más sencilla posible.

---

## El Panel de Control (Lado Izquierdo)

Aquí es donde tú mandas. Tienes varios deslizadores para configurar los detalles de tu proyecto. Están divididos en categorías:

### 1. Variables Eléctricas (La Energía que entra)
*   **Voltaje de pico (Vmax):** Es la "fuerza" máxima que tu amplificador de sonido le entregará a la bobina. Si el amplificador tiene más volumen, este número será mayor.
*   **Resistencia DC (Rtarget):** Todo alambre de cobre pone un poco de "freno" (resistencia) a la energía. Aquí le dices a la calculadora cuánto "freno" quieres que tenga tu bobina final. Lo ideal es que se parezca al número que acepta tu amplificador (por ejemplo, 8 ohmios).
*   **Frecuencia (f):** Es la nota musical o el tono (qué tan grave o agudo es) que enviarás. Debido a la física de los imanes, el gong vibrará *al doble* de la velocidad que pongas aquí. (Ej: Si pones 1000, el gong vibrará a 2000).

### 2. Variables Magnéticas (El Corazón de Metal)
Para que el alambre empuje fuerte, necesita enrollarse sobre un núcleo de metal.
*   **Permeabilidad efectiva (μ_eff):** Indica qué tan bueno es tu núcleo de metal para transportar el magnetismo. Si no estás seguro, déjalo en el valor por defecto (10).
*   **Área del núcleo (Ac):** Es el tamaño o grosor de la punta de metal que apuntará hacia el gong. Un área más grande empuja un espacio más amplio.
*   **Camino magnético (lc):** Qué tan largo es el recorrido total que hace el magnetismo por dentro del metal y por el aire.
*   **Saturación del núcleo (B_sat):** Los metales tienen un límite de cuánto magnetismo pueden llevar a la vez (como un tubo de agua que se llena). Este número te avisa cuál es ese límite antes de que tu bobina deje de volverse más fuerte.

### 3. Acoplamiento al Gong (La Interacción Física)
*   **Entrehierro (gap):** La distancia física (en milímetros) entre la punta de tu bobina y el gong. **Muy importante:** Mientras más cerca, más fuerte empuja, pero ten cuidado; si lo pones muy cerca, el gong podría chocar con la bobina al vibrar.
*   **Paso polar (w_polo):** Es la distancia entre el centro de tu imán y sus bordes. Ayuda a calcular cómo se reparte la fuerza magnética en el aire.
*   **Espesor del bronce:** Qué tan grueso es el gong en el área donde le estás apuntando con la bobina.
*   **Resistividad del bronce (ρ_t):** Qué tan "terco" es el metal de tu gong frente a la electricidad. Si usas bronce de campana, los valores recomendados ya están ahí.

### 4. Geometría del Alambre / Carrete (La Construcción Física)
Aquí diseñas físicamente el rollo de alambre de cobre (el carrete).
*   **Calibre del alambre (AWG):** Qué tan grueso es el hilo de cobre. **Cuidado:** en los calibres (AWG), un número *más pequeño* significa un alambre *más grueso*. (Ej. AWG 20 es más grueso que AWG 30). Si usas alambre muy delgado, se puede derretir.
*   **Alto y Profundidad de la ventana (hw y dw):** Es el tamaño del espacio en tu carrete de plástico donde vas a enrollar todo el alambre.
*   **Perímetro medio (perim):** Cuánto mide, en promedio, una sola vuelta de alambre alrededor del centro de plástico.

### 5. Adaptación al Amplificador (Que se lleven bien)
Tu amplificador y tu bobina deben "hablar el mismo idioma" para funcionar bien juntos sin que nada se rompa.
*   **Impedancia del amplificador (Zamp):** Revisa el manual o la parte trasera de tu amplificador. Generalmente dice 4Ω (ohmios) u 8Ω. Pon ese número ahí.
*   **Resonancia serie (capacitor):** ¡Este es un truco secreto! Si lo activas, la calculadora te dirá qué componente electrónico extra (un capacitor) debes añadir para multiplicar inmensamente la fuerza de empuje sin cambiar tu bobina.
*   **Adaptación con transformador:** Si tu bobina es muy extraña y no encaja para nada con el amplificador, puedes prender esta opción para diseñar un transformador intermedio (una especie de adaptador de corriente) que arregle el problema.

### Herramientas Mágicas del Panel
*   **El botón del Candado (🔒):** Verás pequeños candados al lado de muchas opciones. Si cierras el candado, le estás diciendo a la calculadora: *"Bajo ninguna circunstancia quiero que cambies este número"*.
*   **El botón "Cálculo automático" (✨):** ¡Es el botón más útil! Si lo presionas, la calculadora probará miles de combinaciones en un segundo intentando darte la configuración que empuje más fuerte al gong. (Solo moverá los deslizadores que no tengan puesto el candado).

---

## Los Resultados (Lado Derecho)

Esta es la "boleta de calificaciones" de tu diseño. Fíjate mucho en los colores:
*   **Verde / Azul:** Tu diseño va por buen camino y es seguro.
*   **Amarillo / Naranja:** Hay una advertencia, la máquina puede funcionar pero no es ideal.
*   **Rosado / Rojo:** ¡PELIGRO! Algo se va a quemar, derretir, o el amplificador se apagará.

¿Qué significan las tarjetas grandes?
*   **Adaptación al ampli:** ¿Se llevan bien tu diseño y tu amplificador? Si sale rojo o amarillo, necesitas ajustar las cosas o usar un transformador/resonancia.
*   **Fuerza sobre el gong (Azul):** El resultado que más nos importa. Te dice exactamente con qué fuerza estás empujando el metal del gong. ¡Intenta hacer que este número sea lo más grande posible!
*   **FMM (Amarillo):** Es la "fuerza bruta" magnética que estás generando.
*   **Saturación del núcleo:** Te avisa si le estás enviando demasiada energía al núcleo de metal. Si dice "¡SATURA!", significa que estás desperdiciando energía y creando puro calor innecesario.
*   **Potencia / Corriente:** Te dice cuánto calor va a generar tu bobina. Si dice "¡sube el calibre!", hazle caso: tu alambre es muy delgado y actuará como el filamento de un bombillo hasta derretirse.
*   **Carrete:** Te dice qué tan lleno quedará tu carrete de plástico. Si pasa del 100%, significa que físicamente es imposible meter todo el alambre que diseñaste en el espacio que dijiste tener.

---

## Gráficas y Planos (Parte Inferior)

*   **El Panel de Recomendaciones (Cajita de texto):** ¡Léelo siempre! Es un asistente escrito que analiza todos tus errores y te da instrucciones directas sobre cómo arreglarlos. (Ej. "Tu alambre es muy delgado, cámbialo a AWG 24").
*   **El Plano Técnico:** Te muestra un esquema muy claro de qué se conecta con qué, junto con un dibujo de tu bobina final que te servirá para saber cómo construirla en la vida real.
*   **Gráficas de Tablero:** Hay unas pestañas que te muestran dibujos del comportamiento eléctrico. Te permiten ver fácilmente si tu bobina solo funciona bien en una nota musical específica, o si es útil en varias, y qué pasaría si usaras cables más gruesos o más delgados.

¡No tengas miedo a romper nada en la calculadora! Juega con los deslizadores, presiona el botón automático y presta atención a las tarjetas de colores para ir mejorando poco a poco tus diseños.
