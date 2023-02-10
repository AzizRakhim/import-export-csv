import { useState } from "react";
import { useCSVReader, usePapaParse, useCSVDownloader } from "react-papaparse";
import "./App.css";

function App() {
  const { CSVReader } = useCSVReader();
  const { jsonToCSV } = usePapaParse();
  const { CSVDownloader, Type } = useCSVDownloader();

  const [tableData, setTableData] = useState<any>([]);
  const [header, setHeader] = useState<any>([]);

  const saveFile = () => {
    let csv = jsonToCSV(tableData);

    console.log(csv);
  };

  return (
    <div className="app">
      <CSVReader
        onUploadAccepted={(results: any) => {
          setTableData(results.data.filter((data: any, i: number) => i !== 0));
          setHeader(results.data[0]);
        }}
      >
        {({ getRootProps, acceptedFile }: any) => (
          <>
            <div className="btn-container">
              <button type="button" {...getRootProps()} className="button">
                Browse file
              </button>
              <div>{acceptedFile && acceptedFile.name}</div>
            </div>
            <hr />
          </>
        )}
      </CSVReader>
      <div className="header-container">
        <h2>User Table</h2>
        <div className="btn-container">
          <button onClick={saveFile} className="convert">
            JSON to CSV
          </button>
          <CSVDownloader
            type={Type.Button}
            filename={"filename"}
            bom={true}
            data={tableData}
            className="download"
          >
            Download
          </CSVDownloader>
        </div>
      </div>
      {tableData.length ? (
        <table>
          <thead>
            <tr>
              {header.map((header: any, index: number) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((data: any, index: number) => (
              <tr key={index}>
                {data.map((datum: any, i: number) => (
                  <td key={i}>
                    <input
                      type="text"
                      value={datum}
                      className="input"
                      onChange={(e: any) => {
                        const tempData = tableData.map(
                          (item: any, idx: number) => {
                            if (idx === index) {
                              item.map((el: any, _index: number) => {
                                if (_index === i) {
                                  return e.target.value;
                                }
                                return el;
                              });
                            }
                            return item;
                          }
                        );
                        setTableData(tempData);
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-data">No data</div>
      )}
    </div>
  );
}

export default App;
