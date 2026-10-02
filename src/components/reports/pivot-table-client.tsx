'use client'

import { useEffect, useMemo, useState } from 'react'
import PivotTableUI from 'react-pivottable'
import 'react-pivottable/pivottable.css'
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers'
import TableRenderers from 'react-pivottable/TableRenderers'
import createPlotlyComponent from 'react-plotly.js/factory'

/**
 * `react-pivottable` ships its own stylesheet, hardcoded to a light blue-grey palette (Verdana,
 * `#ebf0f8`, `#c8d4e3`, white cells). Left alone it is the one surface in the app that ignores
 * the theme entirely — unreadable in dark mode. These scoped overrides repaint its chrome with
 * our tokens; `!` is needed because the library's own selectors are more specific.
 */
const PIVOT_THEME = [
  '[&_.pvtUi]:!font-sans [&_.pvtUi]:!text-text',
  '[&_table.pvtTable]:!font-sans [&_table.pvtTable]:!text-xs',
  '[&_table.pvtTable_thead_tr_th]:!border-border [&_table.pvtTable_thead_tr_th]:!bg-surface-muted [&_table.pvtTable_thead_tr_th]:!text-xs [&_table.pvtTable_thead_tr_th]:!text-text-body',
  '[&_table.pvtTable_tbody_tr_th]:!border-border [&_table.pvtTable_tbody_tr_th]:!bg-surface-muted [&_table.pvtTable_tbody_tr_th]:!text-xs [&_table.pvtTable_tbody_tr_th]:!text-text-body',
  '[&_table.pvtTable_tbody_tr_td]:!border-border [&_table.pvtTable_tbody_tr_td]:!bg-surface [&_table.pvtTable_tbody_tr_td]:!text-text-body',
  '[&_.pvtAxisContainer]:!border-border [&_.pvtAxisContainer]:!bg-surface-muted',
  '[&_.pvtVals]:!border-border [&_.pvtVals]:!bg-surface-muted',
  '[&_.pvtAxisContainer_li_span.pvtAttr]:!border-border [&_.pvtAxisContainer_li_span.pvtAttr]:!bg-surface [&_.pvtAxisContainer_li_span.pvtAttr]:!text-text-body',
  '[&_li.pvtPlaceholder]:!border-border',
  '[&_.pvtDropdownCurrent]:!border-border [&_.pvtDropdownCurrent]:!bg-surface',
  '[&_.pvtDropdownMenu]:!border-border [&_.pvtDropdownMenu]:!bg-surface',
  '[&_.pvtDropdownActiveValue]:!bg-surface-muted',
  '[&_.pvtDropdownIcon]:!text-text-muted [&_.pvtTriangle]:!text-text-muted [&_.pvtDragHandle]:!text-text-muted',
  '[&_.pvtButton]:!border-border [&_.pvtButton]:!bg-surface [&_.pvtButton]:!text-text-body',
  '[&_.pvtFilterBox]:!border-border [&_.pvtFilterBox]:!bg-surface [&_.pvtFilterBox]:!text-text',
  '[&_.pvtFilterBox_input]:!border-border [&_.pvtFilterBox_input]:!bg-surface [&_.pvtFilterBox_input]:!text-text'
].join(' ')

interface PivotTableClientProps {
  /** Sheet-shaped data: row 0 is the header, the rest are values.
   *
   * Loosely typed on purpose: `@types/react-pivottable` declares the input as `string[][]`,
   * but the Sum aggregator this screen defaults to only works because the numeric columns are
   * actually numbers. The published types are wrong, not the data. */
  data: any[]
}

export function PivotTableClient({ data }: PivotTableClientProps) {
  const [plotlyReady, setPlotlyReady] = useState(false)
  const [plotlyFailed, setPlotlyFailed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Plotly) {
      setPlotlyReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.plot.ly/plotly-3.1.1.min.js'
    script.crossOrigin = 'anonymous'
    script.onload = () => setPlotlyReady(true)
    // A blocked corporate network is the realistic case. Without this the chart renderers never
    // arrive, the default `Grouped Column Chart` does not exist in `TableRenderers`, and the card
    // stays blank forever with nothing said.
    script.onerror = () => setPlotlyFailed(true)
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const [pivotState, setPivotState] = useState<any>({
    data,
    rows: ['Nome Cliente'],
    cols: ['Status Pedido'],
    aggregatorName: 'Sum',
    vals: ['Valor Pedido'],
    rendererName: 'Grouped Column Chart',
    plotlyOptions: { width: 900, height: 700 },
    plotlyConfig: {}
  })

  // `data` was only ever read by the `useState` initializer, so applying a filter re-rendered
  // the page around a pivot table still showing the first period the user landed on. Syncing on
  // a content signature (not on identity, which changes on every RSC payload) refreshes the rows
  // while keeping the pivot configuration the user assembled.
  const dataSignature = `${data?.length ?? 0}|${JSON.stringify(data?.[1] ?? null)}`
  useEffect(() => {
    setPivotState((previous: any) => ({ ...previous, data }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSignature])

  const renderers = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).Plotly) {
      const Plot = createPlotlyComponent((window as any).Plotly)
      return Object.assign({}, TableRenderers, createPlotlyRenderers(Plot))
    }

    return TableRenderers
  }, [plotlyReady])

  // Falling back to a table renderer keeps the pivot usable when the chart renderers cannot load;
  // the default `Grouped Column Chart` would otherwise render nothing at all.
  const activeState = plotlyFailed ? { ...pivotState, rendererName: 'Table' } : pivotState

  return (
    <div className={`w-full ${PIVOT_THEME}`}>
      {plotlyFailed && (
        <p className='text-caption mb-3 rounded-xl border border-warning-border bg-warning px-4 py-2.5 text-warning-foreground'>
          Os gráficos da tabela dinâmica não puderam ser carregados (a biblioteca vem de um servidor
          externo). O cruzamento continua funcionando em formato de tabela.
        </p>
      )}

      <div className='overflow-x-auto'>
        <PivotTableUI renderers={renderers} onChange={(state: any) => setPivotState(state)} {...activeState} />
      </div>
    </div>
  )
}
