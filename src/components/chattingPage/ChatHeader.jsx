import styled from "styled-components";
import { Container,Section,Area} from "../../styles/Layouts"
import { ButtonComp } from "../../styles/example/Button"
import { media } from "../../utils/MediaQuery";
import { useDispatch } from "react-redux";
import { changeChat } from "../../store/actions/ChattingActions";
import { useState } from "react";


const Containerstyle = styled(Container)`
  position: relative;
  width: 400px;
  height: 600px;
  background: #333333;
  border: 1px solid black;
  border-radius: 8px;
  overflow: visible;
  padding: 12px;

  &::before {
  content: '';
  position: absolute;
  top: -2%; 
  left: 10%;
  transform: translateX(700%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 20px 20px;  /* 변경된 부분 */
  border-color: transparent transparent #333333;  /* 변경된 부분 */
}
${media.small`
    /* 미디어 쿼리 small에 해당하는 스타일 */
    width: 100%;
    height:96vh;
    padding: 0;
    &::before{
      content:none;
    }
  `}
`;

// 채팅 헤더 + Box
export const ChatHeader=(props)=>{
  const {children,setState } =props;
  const [isDisabled, setIsDisabled] = useState(false);

  const stateClick = (state,Boolean) => {
    setIsDisabled(Boolean);
    setState(state)
  };
  
  return(
      <Containerstyle>
        <Section $direction="column" $height="100%" $background="white" style={{borderRadius:"9px 9px 0px 0px"}}>
          <Area $height="none">
          <ButtonComp onClick={()=>stateClick("FRIENDS",true)} className={isDisabled ? 'false':""}$width="50%" $height="70px" $fontSize="1.5em" $borderRadius="8px 0px 0px 0px" >
            FRIENDS
          </ButtonComp>
          <ButtonComp onClick={()=>stateClick("CHAT",false)} className={isDisabled ? '':"false"} $width="50%" $height="70px" $fontSize="1.5em" $borderRadius="0px 8px 0px 0px" >
            CHAT
          </ButtonComp>
          </Area>
          <Area $direction="column" style={{overflow:"hidden"}}>
            {children}
          </Area>
        </Section>
      </Containerstyle>
  )
}