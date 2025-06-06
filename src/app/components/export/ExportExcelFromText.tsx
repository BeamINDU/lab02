'use client';
import React from 'react';
import { ExportExcel } from '../../lib/exports/exportExcel';

const ExportExcelFromText: React.FC = () => {
  const data = `172. **[T]** The Holling type II equation is described by
\[ f(x) = \frac{ax}{n + x} \]
where \( x \) is the amount of prey available and \( a > 0 \) is the maximum consumption rate of the predator.

a. Graph the Holling type II equation given \( a = 0.5 \) and \( n = 5 \). What are the differences between the Holling type I and II equations?

b. Take the first derivative of the Holling type II equation and interpret the physical meaning of the derivative.

c. Show that \( f(n) = \frac{1}{2}a \) and interpret the meaning of the parameter \( n \).

d. Find and interpret the meaning of the second derivative. What makes the Holling type II function more realistic than the Holling type I function?

173. **[T]** The Holling type III equation is described by
\[ f(x) = \frac{ax^2}{n^2 + x^2} \]
where \( x \) is the amount of prey available and \( a > 0 \) is the maximum consumption rate of the predator.

a. Graph the Holling type III equation given \( a = 0.5 \) and \( n = 5 \). What are the differences between the Holling type II and III equations?

b. Take the first derivative of the Holling type III equation and interpret the physical meaning of the derivative.

c. Find and interpret the meaning of the second derivative (it may help to graph the second derivative).

d. What additional ecological phenomena does the Holling type III function describe compared with the Holling type II function?

174. **[T]** The populations of the snowshoe hare (in thousands) and the lynx (in hundreds) collected over 7 years from 1937 to 1943 are shown in the following table. The snowshoe hare is the primary prey of the lynx.

| Population of snowshoe hare (thousands) | Population of lynx (hundreds) |
|----------------------------------------|------------------------------|
| 20                                     | 10                           |
| 55                                     | 15                           |
| 65                                     | 55                           |
| 95                                     | 60                           |

**Table 3.5 Snowshoe Hare and Lynx Populations**

Source: http://www.biotopics.co.uk/newgcse/predatorprey.html.

a. Graph the data points and determine which Holling-type function fits the data best.

b. Using the meanings of the parameters \( a \) and \( n \), determine values for those parameters by examining a graph of the data. Recall that \( n \) measures what prey value results in the half-maximum of the predator value.

c. Plot the resulting Holling-type I, II, and III functions on top of the data. Was the result from part a. correct?`;

  return (
    <button
      onClick={() => ExportExcel(data, 'Holling_Equations')}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
    >
      Test Export Excel
    </button>
  );
};

export default ExportExcelFromText;
