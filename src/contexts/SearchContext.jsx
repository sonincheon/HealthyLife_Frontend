// SearchContext.js 파일: 검색 기능과 관련된 상태 관리를 위한 컨텍스트와 프로바이더, 그리고 커스텀 훅을 포함합니다.
import React, { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";
import { useApiRequest } from "../hooks/useApiRequest"; // API 요청을 처리하기 위한 커스텀 훅을 가져옵니다.
import MedicineApi from "../api/MedicineApi"; // 의약품 정보를 조회하는 API 함수들이 정의된 모듈입니다.
import { type } from "@testing-library/user-event/dist/type";

const BACKEND_DOMAIN = process.env.REACT_APP_BACKEND_DOMAIN;

// Context 생성: 검색 기능 관련 데이터와 메소드를 컴포넌트 트리에 제공하기 위한 컨텍스트를 생성합니다.
const SearchContext = createContext();

// 초기 상태 정의: 검색 기능의 초기 상태 값을 정의합니다. 이 상태에는 타입 리스트, 체크박스 상태, 콤보박스 상태 등이 포함됩니다.
const initialState = {
  typeList: {}, // API로부터 로드된 타입 리스트
  checkBoxStates: {}, // 각 체크박스의 선택 상태
  comboBoxId: "", // 현재 활성화된 콤보박스의 ID
  openComboBoxes: {}, // 콤보박스의 열림/닫힘 상태
  searchType: "통합",
  searchQuery: "", // 사용자가 입력한 검색 쿼리
  size: 10, // 페이지당 표시할 검색 결과의 수
  searchResults: [], // 검색 결과
  totalCount: 0, // 검색 결과의 총 개수
};

// Reducer 함수 정의: 상태를 업데이트하는 로직을 담고 있는 함수입니다. 액션의 타입에 따라 상태를 어떻게 변경할지 결정합니다.
const searchReducer = (state, action) => {
  switch (action.type) {
    case "SET_TYPE_LIST":
      return { ...state, typeList: action.payload };
    case "TOGGLE_COMBOBOX": {
      const isAlreadyOpen = state.openComboBox === action.payload;
      return {
        ...state,
        openComboBox: isAlreadyOpen ? null : action.payload,
      };
    }
    case "SET_CHECKBOX_STATES": {
      const { comboBoxId, checkBoxId, isChecked } = action.payload;
      return {
        ...state,
        checkBoxStates: {
          ...state.checkBoxStates,
          [comboBoxId]: {
            ...state.checkBoxStates[comboBoxId],
            [checkBoxId]: isChecked,
          },
        },
      };
    }
    case "RESET_COMBOBOX": {
      const { comboBoxId } = action.payload;
      const resetCheckBoxStates = { ...state.checkBoxStates, [comboBoxId]: {} };
      return {
        ...state,
        checkBoxStates: resetCheckBoxStates,
      };
    }
    case "SET_SEARCH_TYPE":
      return { ...state, searchType: action.payload }; // searchType 상태 업데이트
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload }; // searchQuery 상태 업데이트
    case "PERFORM_SEARCH": {
      const results = performSearchLogic(state.checkBoxStates, state.searchQuery, state.pageSize);
      return { ...state, searchResults: results };
    }
    default:
      return state;
  }
};


// SearchProvider 컴포넌트: 검색 관련 상태와 액션을 자식 컴포넌트에게 제공합니다.
export const SearchProvider = ({ children }) => {
  const [state, dispatch] = useReducer(searchReducer, initialState); // useReducer 훅을 사용하여 상태와 dispatch 함수를 관리합니다.
  const {
    data: listByTypeData,
    loading,
    error,
  } = useApiRequest(MedicineApi.getListByType); // API 요청을 위한 커스텀 훅 사용
  
  useEffect(() => { // API로부터 타입 리스트 데이터를 받아오면 상태를 업데이트합니다.
    if (listByTypeData) {
      dispatch({ type: "SET_TYPE_LIST", payload: listByTypeData });
    }
  }, [listByTypeData]);

  const contextValue = { // 자식 컴포넌트에게 제공할 상태와 액션
    state,
    actions: {
      toggleComboBox: (comboBoxId) => dispatch({ type: "TOGGLE_COMBOBOX", payload: comboBoxId }),
      handleCheckboxChange: (comboBoxId, checkBoxId, isChecked) =>dispatch({ type: "SET_CHECKBOX_STATES", payload: { comboBoxId, checkBoxId, isChecked } }),
      resetComboBox: (comboBoxId) => dispatch({ type: "RESET_COMBOBOX", payload: { comboBoxId } }),
      setSearchType: (type) => dispatch({ type: "SET_SEARCH_TYPE", payload: type }),
    setSearchQuery: (query) => dispatch({ type: "SET_SEARCH_QUERY", payload: query }),
      performSearch: () => dispatch({ type: "PERFORM_SEARCH" }),
    },
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children} 
    </SearchContext.Provider>
  );
};

// Custom Hook: SearchContext를 사용하기 위한 커스텀 훅입니다.
export const useSearch = () => {
  const context = useContext(SearchContext); // Context를 사용하여 현재 컨텍스트 값을 가져옵니다.
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider"); // 컨텍스트가 없는 경우 에러 발생
  }
  const { state, dispatch, actions } = context; // 상태, dispatch 함수, 액션을 구조 분해 할당으로 추출합니다.
  return { state, dispatch, actions }; // 사용할 수 있도록 반환
};

const performSearchLogic = async (dispatch, state) => {
  
  const { searchQuery, size, checkBoxStates, searchType, sortField, sortAscending, page  } = state;

  try {
    // 서버 요구사항에 맞춰서 파라미터 이름 조정
    const params = {
      productName: searchType === "제품명" ? searchQuery : undefined,
      reportNo: searchType === "신고 번호" ? searchQuery : undefined,
      company: searchType === "제조사" ? searchQuery : undefined,
      functionalities: Object.keys(checkBoxStates).join(","),
      type: searchType,
      sortField: sortField,
      sortAscending: sortAscending,
      page: page,
      size: size,
      // sortField, sortAscending 등 필요한 파라미터 추가
    };

    // axios를 사용하여 서버에 검색 요청
    const response = await axios.get(`${BACKEND_DOMAIN}/api/filter/search`, { params });
    // 검색 결과를 상태에 저장
    dispatch({ type: "SET_SEARCH_RESULTS", payload: response.data });
  } catch (error) {
    console.error("검색 실패:", error);
    // 오류 처리 로직 추가
  }
};
