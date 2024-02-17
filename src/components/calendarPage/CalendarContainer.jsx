import styled from "styled-components";
import React, { useEffect, useState } from "react";
import MiddleModal from "../../styles/modals/MiddleModal";
import { MiddleButton } from "../../styles/styledComponents/StyledComponents";
import CalendarApi from "../../api/CalendarApi";
import {
  ComboBoxContainer,
  ComboBoxSection,
  ComboSelectBox,
  ComboBox,
  MealInput,
  MealLabel,
  MealTitle,
  MealInfoList,
  MealInfo,
  AddButton,
  InputField,
  InputAddBtn,
  SearchResultContainer,
  SearchResultItem,
} from "./CalendarStyle";
import { useCalendar } from "../../contexts/CalendarContext";

export const MealBox = () => {
  const { state, actions } = useCalendar();
  const MealTypes = ["아침", "점심", "저녁"];
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (mealType) => {
    setModalOpen(true);
    actions.setMealType(mealType);
  };

  const closeModal = () => {
    setModalOpen(false);
    actions.setMealType("");
  };

  return (
    <>
      <ComboBoxContainer>
        <ComboSelectBox>
          {MealTypes.map((mealType) => (
            <ComboBox key={mealType}>
              <MealTitle>
                <MealInput>
                  <h2>{mealType}</h2>
                </MealInput>
                <AddButton onClick={() => openModal(mealType)}> + </AddButton>
              </MealTitle>
              <MealInfoList>
                {/* 배열을 받아오지 못했을때 에러가 나는걸 방지하기 위한 &&연산자 */}
                {/* && 연산자는 A && B 일때 둘다 TRUE이면 B를 실행 */}
                {Array.isArray(state.dateData.meal) &&
                  state.dateData.meal
                    .filter((meal) => meal.meal_type === mealType)
                    .map((meal) => (
                      <MealInfo key={meal.id}>{meal.meal_name}</MealInfo>
                    ))}
              </MealInfoList>
            </ComboBox>
          ))}
          <div>운동</div>
          <MealInfoList>
            {Array.isArray(state.dateData.workout) &&
              state.dateData.workout.map((workout) => (
                <MealInfo key={workout.id}>{workout.workout_name}</MealInfo>
              ))}
          </MealInfoList>
          <AddButton onClick={() => openModal("운동")}> + </AddButton>
        </ComboSelectBox>
      </ComboBoxContainer>
      <MiddleModal $isOpen={modalOpen} $onClose={closeModal}>
        <MealInputBox closeModal={closeModal} />
      </MiddleModal>
    </>
  );
};

export const MealInputBox = () => {
  const { state, actions } = useCalendar();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
    setSelectedItem(null);
  };

  const handleSearchResultClick = async (item) => {
    console.log(item);
    setSelectedItem(item.name);
    setSearchQuery(item.name);
    console.log(state.mealType);
  };

  const handleAddClick = async () => {
    if (Object.keys(selectedItem).length > 0) {
      try {
        console.log(
          state.mealType,
          selectedItem,
          state.email,
          state.selectedDate
        );

        // addMealAndFetchUpdatedInfo 액션 호출
        await actions.addMealAndUpdate(
          state.email,
          state.mealType,
          state.selectedDate,
          selectedItem
        );
      } catch (e) {
        console.error("데이터 가져오는 중 오류 발생", e);
      }
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const fetchSearchResults = async () => {
        try {
          if (state.mealType === "운동") {
            const result = await CalendarApi.getExerciseList({
              keyword: searchQuery,
            });
            setSearchResults(result);
          } else {
            const result = await CalendarApi.getFoodList({
              keyword: searchQuery,
            });
            setSearchResults(result);
          }
        } catch (e) {
          console.log(e);
        }
      };
      fetchSearchResults();
    }
  }, [searchQuery]);

  return (
    <>
      <ComboBoxContainer>
        <ComboBoxSection>
          <ComboSelectBox>
            <InputField
              type="text"
              placeholder="메뉴를 입력하세요."
              value={searchQuery}
              onChange={handleSearchQueryChange}
            />
          </ComboSelectBox>
        </ComboBoxSection>

        {searchQuery && (
          <SearchResultContainer>
            {state.mealType === "운동"
              ? searchResults.map((item, index) => (
                  // 운동 검색 결과 렌더링
                  <SearchResultItem
                    key={index}
                    onClick={() => handleSearchResultClick(item)}>
                    <p className="workout-name">{item.name}</p>
                    <p className="workout-duration">{item.muscle}</p>
                    <p className="workout-intensity">{item.equipment}</p>
                  </SearchResultItem>
                ))
              : searchResults.map((item, index) => (
                  // 음식 검색 결과 렌더링
                  <SearchResultItem
                    key={index}
                    onClick={() => handleSearchResultClick(item)}>
                    <p className="food-name">{item.name}</p>
                    <p className="food-size">{item.servingSize}g</p>
                    <p className="food-kcal">{item.kcal}kcal</p>
                  </SearchResultItem>
                ))}
          </SearchResultContainer>
        )}

        <InputAddBtn onClick={() => handleAddClick()}>추가하기</InputAddBtn>
      </ComboBoxContainer>
    </>
  );
};

export const DateDetails = () => {
  const { state, actions } = useCalendar();
};
