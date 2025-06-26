import { cn } from '@/lib/utils'

const Table = ({ children, className }) => {
  return (
    <div className="relative w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm", className)}>
        {children}
      </table>
    </div>
  )
}

const TableHeader = ({ children, className }) => {
  return (
    <thead className={cn("[&_tr]:border-b", className)}>
      {children}
    </thead>
  )
}

const TableBody = ({ children, className }) => {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)}>
      {children}
    </tbody>
  )
}

const TableFooter = ({ children, className }) => {
  return (
    <tfoot className={cn("border-t bg-gray-50/50 font-medium [&>tr]:last:border-b-0", className)}>
      {children}
    </tfoot>
  )
}

const TableRow = ({ children, className }) => {
  return (
    <tr className={cn(
      "border-b transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-50",
      className
    )}>
      {children}
    </tr>
  )
}

const TableHead = ({ children, className }) => {
  return (
    <th className={cn(
      "h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0",
      className
    )}>
      {children}
    </th>
  )
}

const TableCell = ({ children, className }) => {
  return (
    <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}>
      {children}
    </td>
  )
}

const TableCaption = ({ children, className }) => {
  return (
    <caption className={cn("mt-4 text-sm text-gray-500", className)}>
      {children}
    </caption>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}