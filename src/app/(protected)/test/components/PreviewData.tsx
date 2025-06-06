import React, { useEffect, useState } from "react";
import { MathJaxContext, MathJax } from "better-react-mathjax";
// import { OcrTextResult } from "../../interface/file";

//--------------------------------------------------------------

// Example JSON data
// const _mockData = {
//   primary_language: "en",
//   natural_text: `1 Years since 1800 | Population (millions)\n---|---\n1 | 0.8795\n11 | 1.040\n21 | 1.264\n31 | 1.516\n41 | 1.661\n51 | 2.000\n61 | 2.634\n71 | 3.272\n81 | 3.911\n91 | 4.422\n\nTable 3.4 Population of London  \nSource:  \nhttp://en.wikipedia.org/wiki/Demographics_of_London.\n\n167.  \n\\[T\\]\n\na. Using a calculator or a computer program, find the best-fit linear function to measure the population.\nb. Find the derivative of the equation in a. and explain its physical meaning.\nc. Find the second derivative of the equation and explain its physical meaning.\n\n168.  \n\\[T\\]\n\na. Using a calculator or a computer program, find the best-fit quadratic curve through the data.\nb. Find the derivative of the equation and explain its physical meaning.\nc. Find the second derivative of the equation and explain its physical meaning.\n\nFor the following exercises, consider an astronaut on a large planet in another galaxy. To learn more about the composition of this planet, the astronaut drops an electronic sensor into a deep trench. The sensor transmits its vertical position every second in relation to the astronaut’s position. The summary of the falling sensor data is displayed in the following table.\n\n| Time after dropping (s) | Position (m) |\n---|---|\n0 | 0 |\n1 | −1 |\n2 | −2 |\n3 | −5 |\n4 | −7 |\n5 | −14 |\n\n169.  \n\\[T\\]\n\na. Using a calculator or computer program, find the best-fit quadratic curve to the data.\nb. Find the derivative of the position function and explain its physical meaning.\nc. Find the second derivative of the position function and explain its physical meaning.\n\n170.  \n\\[T\\]\n\na. Using a calculator or computer program, find the best-fit cubic curve to the data.\nb. Find the derivative of the position function and explain its physical meaning.\nc. Find the second derivative of the position function and explain its physical meaning.\nd. Using the result from c. explain why a cubic function is not a good choice for this problem.\n\nThe following problems deal with the Holling type I, II, and III equations. These equations describe the ecological event of growth of a predator population given the amount of prey available for consumption.\n\n171.  \n\\[T\\]  \nThe Holling type I equation is described by  \n\\[f(x) = ax,\\]  \nwhere  \\(x\\) is the amount of prey available and  \\(a > 0\\) is the rate at which the predator meets the prey for consumption.\n\na. Graph the Holling type I equation, given  \\(a = 0.5\\).\nb. Determine the first derivative of the Holling type I equation and explain physically what the derivative implies.\nc. Determine the second derivative of the Holling type I equation and explain physically what the derivative implies.\nd. Using the interpretations from b. and c. explain why the Holling type I equation may not be realistic.`
// };

//--------------------------------------------------------------

// Define types for our JSON data
interface ResponseData {
  primary_language: string;
  is_rotation_valid: boolean;
  rotation_correction: number;
  is_table: boolean;
  is_diagram: boolean;
  natural_text: string;
}

interface PageData {
  page: number;
  response: ResponseData;
}

// interface JsonData {
//   type: string;
//   data: PageData;
// }

// MathJax configuration
const config = {
  loader: { load: ["[tex]/html"] },
  tex: {
    packages: { "[+]": ["html"] },
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"],
    ],
  },
};


// Define styles types
interface StylesProps {
  [key: string]: React.CSSProperties;
}

// Table component props
interface TableProps {
  data: string;
}

// Table component
const Table: React.FC<TableProps> = ({ data }) => {
  const tableLines = data.split("\n").filter((line) => line.includes("|"));

  // Make sure we have valid table data
  if (tableLines.length < 3) {
    return <p>Invalid table data</p>;
  }

  const headers = tableLines[0]
    .split("|")
    .filter((h) => h.trim() !== "")
    .map((h) => h.trim());

  const bodyRows = tableLines.slice(2).map((row) =>
    row
      .split("|")
      .filter((cell, index) => index > 0 && index < row.split("|").length - 1)
      .map((cell) => cell.trim())
  );

  const tableStyles: StylesProps = {
    table: {
      borderCollapse: "collapse",
      width: "100%",
      border: "2px solid #4a5568",
      margin: "1rem 0",
      fontSize: "0.875rem",
    },
    th: {
      border: "2px solid #4a5568",
      padding: "8px",
      backgroundColor: "#f8fafc",
      fontWeight: "bold",
      textAlign: "left",
      fontSize: "0.875rem",
    },
    td: {
      border: "2px solid #4a5568",
      padding: "8px",
      textAlign: "left",
      fontSize: "0.875rem",
    },
  };

  return (
    <table style={tableStyles.table}>
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index} style={tableStyles.th}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {bodyRows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} style={tableStyles.td}>
                <MathJax>{cell}</MathJax>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Process Markdown links
const processLinks = (text: string): string => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let result = text;
  let match;
  const replacements: Array<{ original: string; replacement: string }> = [];

  while ((match = linkRegex.exec(text)) !== null) {
    replacements.push({
      original: match[0],
      replacement: `<a href="${match[2]}" target="_blank" rel="noopener noreferrer" style="color: #3182ce; text-decoration: underline;">${match[1]}</a>`,
    });
  }

  for (let i = replacements.length - 1; i >= 0; i--) {
    result = result.replace(
      replacements[i].original,
      replacements[i].replacement
    );
  }

  return result;
};

// Process bold text
const processBold = (text: string): string => {
  return text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
};

// Main App component
interface PreviewDataProps {
  data: string;
}

export default function PreviewData({ data }: PreviewDataProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      // const parsed: OcrTextResult  = JSON.parse(data);
      // setContent(parsed.natural_text);
      setContent(data);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          // fontFamily: "Arial, sans-serif",
        }}
      >
         Loading...
      </div>
    );
  }

  const containerStyles: React.CSSProperties = {
    maxWidth: "900px",
    margin: "0 auto",
    // padding: "20px",
    // fontFamily: "Arial, sans-serif",
  };

  const cardStyles: React.CSSProperties = {
    // backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    // boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
  };

  const paragraphStyles: React.CSSProperties = {
    marginBottom: "16px",
    lineHeight: "1.6",
    fontSize: "0.875rem",
  };

  // const titleStyles: React.CSSProperties = {
  //   fontSize: "24px",
  //   fontWeight: "bold",
  //   marginBottom: "24px",
  //   textAlign: "center",
  // };

  // Split the content into paragraphs
  const paragraphs = content.split("\n\n").filter((p) => p.trim());

  return (
    <MathJaxContext version={3} config={config}>
      <div style={containerStyles}>
        {/* <h1 style={titleStyles}></h1> */}

        <div style={cardStyles}>
          {paragraphs.map((paragraph, pIndex) => {
            // Check if paragraph contains a table (has multiple pipe characters)
            if (paragraph.includes("|") && paragraph.split("|").length > 2) {
              return <Table key={pIndex} data={paragraph} />;
            } else {
              // Process text content with MathJax
              return (
                <MathJax key={pIndex}>
                  <div
                    style={paragraphStyles}
                    dangerouslySetInnerHTML={{
                      __html: processBold(processLinks(paragraph)),
                    }}
                  />
                </MathJax>
              );
            }
          })}
        </div>
      </div>
    </MathJaxContext>
  );
};

