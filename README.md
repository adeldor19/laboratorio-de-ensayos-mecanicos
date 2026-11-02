# Laboratorio de Ensayos Mecánicos

Aplicación web educativa para visualizar y experimentar con cuatro ensayos mecánicos: tracción, dureza Brinell, dureza Vickers y resiliencia Charpy.

## Uso

Abre `index.html` en un navegador moderno. Para publicar con GitHub Pages:

1. Entra en **Settings → Pages**.
2. Selecciona **Deploy from a branch**.
3. Elige la rama `main` y la carpeta `/ (root)`.
4. Guarda los cambios.

## Simuladores

- **Tracción:** curva esfuerzo-deformación estimada, cálculo de tensión y deformación, comportamiento elástico/plástico y rotura simplificada.
- **Brinell:** cálculo de HBW a partir del diámetro de bola, carga y diámetro de huella.
- **Vickers:** cálculo de HV a partir de la carga y diagonal media.
- **Charpy:** balance de energía potencial, energía absorbida y altura de retorno del péndulo.

## Alcance científico

Las simulaciones son modelos didácticos simplificados. Los valores de los materiales y los criterios visuales de rotura son orientativos y no sustituyen datos certificados, ensayos físicos ni procedimientos normalizados. Las fórmulas se aplican con las unidades indicadas en cada simulador.

La gráfica de tracción usa una curva esquemática generada mediante parámetros representativos; no es una curva experimental ni una ley constitutiva completa. La transición a rotura es una aproximación pedagógica.

## Tecnologías

HTML, CSS y JavaScript. Chart.js se carga desde CDN para representar las gráficas.
