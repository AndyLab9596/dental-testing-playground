| Filter     | Property      | Default Value | Slider Range | Min  | Max  | Meaning |
|------------|--------------|---------------|--------------|------|------|---------|
| Brightness | `brightness` | 0             | -1 to 1      | -1   | 1    | Adjusts the overall lightness or darkness of the image. Negative values darken, positive values brighten. |
| Averaging  | N/A           | N/A           | N/A          | N/A  | N/A  | Smooths the image by averaging pixel values, reducing detail and noise. (Typically applied via convolution, not a property with min/max.) |
| Noise      | `noise`       | 0             | 0 to 100     | 0    | 100  | Adds random variations in pixel values to create a grainy effect. Higher values mean more visible noise. |
| Contrast   | `contrast`    | 0             | -1 to 1      | -1   | 1    | Adjusts the difference between light and dark areas. Negative values reduce contrast, positive values increase it. |
| Gamma      | `gamma`       | [1, 1, 1]     | 0.01 to 2    | 0.01 | 2    | Adjusts the brightness of each color channel (Red, Green, Blue) independently. Lower values darken, higher values brighten. |
