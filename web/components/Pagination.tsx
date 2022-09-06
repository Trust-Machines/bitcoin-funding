import { FC, useEffect, useState } from 'react'
import { StyledIcon } from './StyledIcon';

export type PaginationParams = {
  totalPages: number,
  currentPage: number,
  pageSelected: any
}

export const Pagination: FC<PaginationParams> = ({ 
  totalPages,
  currentPage,
  pageSelected
}) => {

  const [buttons, setButtons] = useState([]);

  useEffect(() => {
   
    const createButtons = async () => {
      let newButtons = [];
      for (let i = 0; i < totalPages; i++) {
        newButtons.push(PaginationButton({
          pageNumber: i, 
          currentPage: currentPage, 
          pageSelected: pageSelected
        }));
      }
      setButtons(newButtons);
    }

    createButtons();
  }, []);

  return (
    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
      <button onClick={() => pageSelected(currentPage-1)} className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20">
        <StyledIcon as="ChevronLeftIcon" size={5} />
      </button>

      {buttons}

      <button onClick={() => pageSelected(currentPage+1)} className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20">
        <StyledIcon as="ChevronRightIcon" size={5} />
      </button>
    </nav>
  )
}

export type PaginationButtonParams = {
  pageNumber: number,
  currentPage: number,
  pageSelected: any
}

export const PaginationButton: FC<PaginationButtonParams> = ({ 
  pageNumber,
  currentPage,
  pageSelected

}) => {
  return (
    <span key={pageNumber}>
      {pageNumber == currentPage ? (
        <button aria-current="page" onClick={() => pageSelected(pageNumber)} className="relative z-10 inline-flex items-center border border-indigo-500 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 focus:z-20">
          {pageNumber+1}
        </button>
      ):(
        <button onClick={() => pageSelected(pageNumber)} className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20">
          {pageNumber+1}
        </button>
      )}
    </span>
  )
}
