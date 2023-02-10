import { useState } from "react";
import { useCSVReader, usePapaParse } from "react-papaparse";
import "./App.css";
import {
  DataGrid,
  GridColDef,
  GridCsvExportOptions,
  GridCsvGetRowsToExportParams,
  GridToolbarContainer,
  useGridApiContext,
  gridFilteredSortedRowIdsSelector,
} from "@mui/x-data-grid";
import { Button, ButtonProps, createSvgIcon } from "@mui/material";

const ExportIcon = createSvgIcon(
  <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" />,
  "SaveAlt"
);

const getRowsFromAllPages = ({ apiRef }: GridCsvGetRowsToExportParams) =>
  gridFilteredSortedRowIdsSelector(apiRef);

const CustomToolbar = () => {
  const apiRef = useGridApiContext();

  const handleExport = (options: GridCsvExportOptions) =>
    apiRef.current.exportDataAsCsv(options);

  const buttonBaseProps: ButtonProps = {
    color: "primary",
    size: "small",
    startIcon: <ExportIcon />,
  };

  return (
    <GridToolbarContainer>
      <Button
        {...buttonBaseProps}
        onClick={() => handleExport({ getRowsToExport: getRowsFromAllPages })}
      >
        Download all
      </Button>
    </GridToolbarContainer>
  );
};

function App() {
  const { CSVReader } = useCSVReader();
  const { jsonToCSV } = usePapaParse();

  const [tableData, setTableData] = useState<any>([]);
  const [header, setHeader] = useState<any>([]);

  const saveFile = () => {
    let csv = jsonToCSV(tableData);

    console.log(csv);
  };

  const columns: GridColDef[] = header.map((item: any) => ({
    field: item,
    headerName: item,
    editable: true,
    width: 300,
  }));

  return (
    <div className="app">
      <CSVReader
        onUploadAccepted={(results: any) => {
          const notFirstData = results.data.filter(
            (_: any, i: number) => i !== 0
          );

          const header = results.data[0];

          const tempData = notFirstData.map((data: any, i: number) => {
            const categoryPosts = data.reduce(
              (acc: any, post: any, i: number) => {
                return { ...acc, [header[i]]: post };
              },
              {}
            );

            return { id: i, ...categoryPosts };
          });

          setTableData(tempData);
          setHeader(header);
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
        </div>
      </div>
      {tableData.length ? (
        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={tableData}
            columns={columns}
            experimentalFeatures={{ newEditingApi: true }}
            components={{ Toolbar: CustomToolbar }}
          />
        </div>
      ) : (
        <div className="no-data">No data</div>
      )}
    </div>
  );
}

export default App;
