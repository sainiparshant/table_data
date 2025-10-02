import axios from "axios"
import React, { useEffect, useRef, useState } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Paginator } from "primereact/paginator"
import { OverlayPanel } from "primereact/overlaypanel"
import "primereact/resources/themes/lara-light-blue/theme.css"
import "primereact/resources/primereact.min.css"
import "primeicons/primeicons.css"
import { ChevronDown } from "lucide-react"
import type { PaginatorPageChangeEvent } from "primereact/paginator"

interface Artwork {
  id: number
  title: string
  place_of_origin: string
  artist_display: string
  inscriptions: string
  date_start: number
  date_end: number
}

interface ApiRes {
  pagination: {
    total: number
    limit: number
    current_page: number
  }
  data: Artwork[]
}

function App() {
  const [data, setData] = useState<Artwork[]>([])
  const [selectedRows, setSelectedRows] = useState<Artwork[]>([])
  const [first, setFirst] = useState(0)
  const [rows, setRows] = useState(12)
  const [total, setTotal] = useState(0)

  const [rowsCount, setRowsCount] = useState("0")

  const op = useRef<OverlayPanel>(null)

  const getData = (page: number) => {
    axios
      .get<ApiRes>(`https://api.artic.edu/api/v1/artworks?page=${page}`)
      .then((res) => {
        setData(res.data.data)
        setTotal(res.data.pagination.total)
      })
      .catch((err) => console.error("fetch err", err))
  }

  useEffect(() => {
    const page = Math.floor(first / rows) + 1
    getData(page)
  }, [first, rows])

  useEffect(() => {
    const need = parseInt(rowsCount) - selectedRows.length
    if (need > 0 && data.length) {
      const newOnPage = data.filter((d) => !selectedRows.find((s) => s.id === d.id))
      const toAdd = newOnPage.slice(0, need)
      if (toAdd.length) {
        setSelectedRows((prev) => [...prev, ...toAdd])
      }
    }
  }, [rowsCount, data])

  const onPageChange = (e: PaginatorPageChangeEvent) => {
    setFirst(e.first)
  }

  const idHeader = (
    <div className="flex items-center">
      <span>ID</span>
      <ChevronDown
        size={16}
        className="ml-1 cursor-pointer"
        onClick={(e) => op.current?.toggle(e)}
      />
      <OverlayPanel ref={op} className="p-3 w-48">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Select Rows
          </label>
          <input
            type="number"
            value={rowsCount}
            onChange={(e) => setRowsCount(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm mb-2"
            min={0}
            max={total}
          />
          <button
            className="w-full bg-blue-500 text-white text-sm py-1 rounded hover:bg-blue-600"
            onClick={() => {
              const num = parseInt(rowsCount)
              if (num > 0) {
                setSelectedRows([])
                if (first !== 0) {
                  setFirst(0)
                } else {
                  setData((p) => [...p])
                }
              }
              op.current?.hide()
            }}
            disabled={parseInt(rowsCount) <= 0}
          >
            Select {rowsCount}
          </button>
        </div>
      </OverlayPanel>
    </div>
  )

  return (
    <div className="p-4">
      <div className="card">
        <DataTable
          value={data}
          selection={selectedRows}
          onSelectionChange={(e) => setSelectedRows(e.value)}
          dataKey="id"
          tableStyle={{ minWidth: "60rem" }}
        >
          <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
          <Column field="id" header={idHeader} />
          <Column field="title" header="Title" />
          <Column field="place_of_origin" header="Place of Origin" />
          <Column field="artist_display" header="Artist" />
          <Column field="inscriptions" header="Inscriptions" />
          <Column field="date_start" header="Start" />
          <Column field="date_end" header="End" />
        </DataTable>
      </div>

      <div className="mt-4">
        <Paginator
          first={first}
          rows={rows}
          totalRecords={total}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  )
}

export default App
