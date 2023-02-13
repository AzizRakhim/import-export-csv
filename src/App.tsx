import { useCallback, useMemo, useState } from "react";
import { useCSVReader } from "react-papaparse";
import "./App.css";
import {
  DataGrid,
  GridColDef,
  GridCsvExportOptions,
  GridCsvGetRowsToExportParams,
  GridToolbarContainer,
  useGridApiContext,
  gridFilteredSortedRowIdsSelector,
  GridCellEditCommitParams,
  MuiEvent,
  GridCellEditStopReasons,
  GridRowModel,
} from "@mui/x-data-grid";

const getRowsFromAllPages = ({ apiRef }: GridCsvGetRowsToExportParams) =>
  gridFilteredSortedRowIdsSelector(apiRef);

const CustomToolbar = () => {
  const apiRef = useGridApiContext();

  const handleExport = (options: GridCsvExportOptions) =>
    apiRef.current.exportDataAsCsv(options);

  return (
    <GridToolbarContainer>
      <button
        type="button"
        className="button down-btn"
        onClick={() => {
          handleExport({ getRowsToExport: getRowsFromAllPages });
        }}
      >
        Download all
      </button>
    </GridToolbarContainer>
  );
};

function App() {
  const { CSVReader } = useCSVReader();

  const [tableData, setTableData] = useState<any>([]);
  const [header, setHeader] = useState<any>([]);

  const onButtonClick = (e: any, row: any) => {
    e.stopPropagation();

    setTableData((prev: any) => prev.filter((item: any) => item.id !== row.id));
  };

  const columns: GridColDef[] = useMemo(() => {
    const temp = header.map((item: any) => ({
      field: item,
      headerName: item,
      editable: true,
      width: 400,
    }));

    return [
      ...temp,
      {
        field: "actions",
        headerName: "Actions",
        width: 500,
        headerAlign: "right",
        align: "right",
        renderCell: (params) => {
          return (
            <button
              type="button"
              className="button"
              onClick={(e) => onButtonClick(e, params.row)}
            >
              Delete
            </button>
          );
        },
      },
    ];
  }, [header]);

  const handleAddRow = () => {
    setTableData((prevRows: any) => [
      { id: Date.now(), username: "Example...", fullName: "Example..." },
      ...prevRows,
    ]);
  };

  const processRowUpdate = useCallback(
    (newRow: GridRowModel) => {
      // Make the HTTP request to save in the backend

      const temp = tableData.map((item: any) => {
        if (item.id === newRow.id) {
          return newRow;
        }

        return item;
      });

      setTableData(temp);

      return newRow;
    },
    [tableData]
  );

  const handleProcessRowUpdateError = useCallback((error: Error) => {
    console.log(error.message);
  }, []);

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
        {({ getRootProps }: any) => (
          <div style={{ position: "relative" }}>
            <div className="btn-container">
              <button type="button" {...getRootProps()} className="button">
                Browse file
              </button>
            </div>
            <hr />
          </div>
        )}
      </CSVReader>
      {tableData.length ? (
        <>
          <div className="btn-holder">
            <button type="button" onClick={handleAddRow} className="button">
              Add a row
            </button>
          </div>
          <div style={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={tableData}
              columns={columns}
              experimentalFeatures={{ newEditingApi: true }}
              components={{ Toolbar: CustomToolbar }}
              processRowUpdate={processRowUpdate}
              onProcessRowUpdateError={handleProcessRowUpdateError}
            />
          </div>
        </>
      ) : (
        <div className="no-data">No data</div>
      )}
    </div>
  );
}

export default App;
