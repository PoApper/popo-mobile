import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Modal,
  Platform,
} from 'react-native';

type PrivacyPolicyProps = {
  visible: boolean;
  onClose: () => void;
  onAgree: () => void;
};

const PrivacyPolicy = ({visible, onClose, onAgree}: PrivacyPolicyProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={Platform.OS === 'android'}
      hardwareAccelerated
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            },
          ]}>
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                {color: isDarkMode ? '#FFFFFF' : '#000000'},
              ]}>
              개인정보 처리 방침
            </Text>
          </View>
          <ScrollView style={styles.scrollView}>
            <Text
              style={[
                styles.content,
                {color: isDarkMode ? '#E0E0E0' : '#333333'},
              ]}>
              {
                '<포항공대 총학생회>(이하 <학생회>)은(는) 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다.\n\n'
              }

              {
                '학생회는 개인정보처리방침을 개정하는 경우 웹사이트 공지사항(또는 개별공지)을 통하여 공지할 것입니다.\n\n'
              }

              {'○ 본 방침은 2019년 10월 13일부터 시행됩니다.\n\n\n'}

              {'1. 개인정보의 처리 목적\n\n'}

              {
                '학생회는 개인정보를 다음의 목적을 위해 처리합니다. 처리한 개인정보는 다음의 목적 이외의 용도로는 사용되지 않으며 이용 목적이 변경될 시에는 사전동의를 구할 예정입니다.\n\n'
              }

              {'가. 홈페이지 회원가입 및 관리\n'}
              {
                '회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 고충처리 등을 목적으로 개인정보를 처리합니다.\n\n'
              }

              {'나. 민원사무 처리\n'}
              {
                '민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보 등을 목적으로 개인정보를 처리합니다.\n\n\n'
              }

              {'2. 수집하는 개인정보의 항목\n\n'}

              {
                '학생회는 회원가입 시점부터 아래의 개인정보 중 일부를 수집합니다. 단, 회원이 각 항목에 해당되지 않을 경우, 해당 항목의 개인정보는 수집하지 않습니다.\n\n'
              }

              {'회원이 회원가입 또는 본인확인을 할 경우\n'}
              {'- 아이디, 비밀번호, 이름, 이메일, 직책\n\n'}

              {'회원이 서비스를 이용하는 경우\n'}
              {'- IP 주소, 쿠키, 방문일시, 서비스 이용기록\n\n\n'}

              {'3. 개인정보의 처리 및 보유 기간\n\n'}

              {
                '① 학생회는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집시에 동의 받은 개인정보 보유,이용기간 내에서 개인정보를 처리,보유합니다.\n\n'
              }

              {'② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.\n\n'}

              {'1. <홈페이지 회원가입 및 관리>\n'}
              {
                '<홈페이지 회원가입 및 관리>와 관련한 개인정보는 수집.이용에 관한 동의일로부터 회원 탈퇴 시까지 위 이용목적을 위하여 보유.이용됩니다.\n'
              }
              {'-보유근거 : 회원가입 시 약관 동의\n'}
              {
                '-예외사유 : 관계 법령 위반에 따른 수사․조사 등이 진행중인 경우에는 해당 수사․조사 종료시까지, 학번 정보의 경우 회원 제재 중 탈퇴 시 부정 가입 방지를 위해 탈퇴 이후 최대 1년까지 보유\n\n'
              }

              {'2. <민원사무 처리>\n'}
              {
                '<민원사무 처리>와 관련한 개인정보는 수집.이용에 관한 동의일로부터 민원사무 처리 완료 시까지 위 이용목적을 위하여 보유.이용됩니다.\n'
              }
              {'-보유근거 : 회원가입 시 약관 동의\n\n\n'}

              {'4. 개인정보의 제3자 제공에 관한 사항\n\n'}

              {
                '① 학생회는 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.\n'
              }
              {
                '② 학생회는 다음과 같이 개인정보를 제3자에게 제공하고 있습니다.\n'
              }
              {'- 개인정보를 제공받는 자 : (학) 포항공과대학교\n'}
              {'- 제공받는 자의 개인정보 이용목적 : 이름, 직책\n'}
              {'- 제공받는 자의 보유.이용기간: 민원사항 처리 완료 시까지\n'}
              {
                '※ 민원사항 처리를 위해 반드시 필요하다고 판단될 경우에만 개인정보를 제 3자에게 제공하고 있습니다.\n\n\n'
              }

              {'5. 정보주체와 법정대리인의 권리·의무 및 그 행사방법\n\n'}

              {
                '이용자는 개인정보주체로써 다음과 같은 권리를 행사할 수 있습니다.\n'
              }
              {
                '① 정보주체는 학생회에 대해 언제든지 개인정보 열람,정정,삭제,처리정지 요구 등의 권리를 행사할 수 있습니다.\n'
              }
              {
                '② 제1항에 따른 권리 행사는 학생회에 대해 개인정보 보호법 시행령 제41조제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 학생회는 이에 대해 지체 없이 조치하겠습니다.\n'
              }
              {
                '③ 제1항에 따른 권리 행사는 정보주체의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수 있습니다. 이 경우 개인정보 보호법 시행규칙 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.\n'
              }
              {
                '④ 개인정보 열람 및 처리정지 요구는 개인정보보호법 제35조 제5항, 제37조 제2항에 의하여 정보주체의 권리가 제한 될 수 있습니다.\n'
              }
              {
                '⑤ 개인정보의 정정 및 삭제 요구는 다른 법령에서 그 개인정보가 수집 대상으로 명시되어 있는 경우에는 그 삭제를 요구할 수 없습니다.\n'
              }
              {
                '⑥ 학생회는 정보주체 권리에 따른 열람의 요구, 정정·삭제의 요구, 처리정지의 요구 시 열람 등 요구를 한 자가 본인이거나 정당한 대리인인지를 확인합니다.\n\n\n'
              }

              {'7. 처리하는 개인정보의 항목 작성\n\n'}

              {'① 학생회는 다음의 개인정보 항목을 처리하고 있습니다.\n'}
              {'1. <홈페이지 회원가입 및 관리>\n'}
              {
                '- 필수항목 : 비밀번호, 로그인ID, 이름, 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보\n\n'
              }

              {'2. <민원사무 처리>\n'}
              {'- 필수항목 : 이름\n\n\n'}

              {'8. 개인정보의 파기\n\n'}

              {
                '학생회는 원칙적으로 개인정보 처리목적이 달성된 경우에는 지체없이 해당 개인정보를 파기합니다. 파기의 절차, 기한 및 방법은 다음과 같습니다.\n\n'
              }

              {'-파기절차\n'}
              {
                '이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져(종이의 경우 별도의 서류) 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다. 이 때, DB로 옮겨진 개인정보는 법률에 의한 경우가 아니고서는 다른 목적으로 이용되지 않습니다.\n\n'
              }

              {'-파기기한\n'}
              {
                '이용자의 개인정보는 개인정보의 보유기간이 경과된 경우에는 보유기간의 종료일로부터 5일 이내에, 개인정보의 처리 목적 달성, 해당 서비스의 폐지, 사업의 종료 등 그 개인정보가 불필요하게 되었을 때에는 개인정보의 처리가 불필요한 것으로 인정되는 날로부터 5일 이내에 그 개인정보를 파기합니다.\n\n'
              }

              {'-파기방법\n'}
              {
                '전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.\n\n\n'
              }

              {'9. 개인정보 자동 수집 장치의 설치•운영 및 거부에 관한 사항\n\n'}

              {
                "① 학생회는 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.\n"
              }
              {
                '② 쿠키는 웹사이트를 운영하는데 이용되는 서버(http)가 이용자의 컴퓨터 브라우저에게 보내는 소량의 정보이며 이용자들의 PC 컴퓨터 내의 하드디스크에 저장되기도 합니다.\n'
              }
              {
                '가. 쿠키의 사용 목적 : 이용자가 방문한 각 서비스와 웹 사이트들에 대한 방문 및 이용형태, 인기 검색어, 보안접속 여부, 등을 파악하여 이용자에게 최적화된 정보 제공을 위해 사용됩니다.\n'
              }
              {
                '나. 쿠키의 설치•운영 및 거부 : 웹브라우저 상단의 도구>인터넷 옵션>개인정보 메뉴의 옵션 설정을 통해 쿠키 저장을 거부할 수 있습니다.\n'
              }
              {
                '다. 쿠키 저장을 거부할 경우 맞춤형 서비스 이용에 어려움이 발생할 수 있습니다.\n\n\n'
              }

              {'10. 개인정보 보호책임자 작성\n\n'}

              {
                '① 학생회는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.\n\n'
              }

              {'▶ 개인정보 보호책임자\n'}
              {'성명 : 박준기\n'}
              {'직책 : 제39대 총학생회 회장\n'}
              {'연락처 : 054-279-2621, stu-39@postech.ac.kr,\n'}
              {'※ 개인정보 보호 담당부서로 연결됩니다.\n\n'}

              {'▶ 개인정보 보호 담당부서\n'}
              {'부서명 : 총학생회\n'}
              {'담당자 : 박준기\n'}
              {'연락처 : 054-279-2621, stu-39@postech.ac.kr,\n\n'}

              {
                '② 정보주체께서는 학생회의 서비스(또는 사업)을 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및 담당부서로 문의하실 수 있습니다. 학생회는 정보주체의 문의에 대해 지체 없이 답변 및 처리해드릴 것입니다.\n\n\n'
              }

              {'11. 개인정보 처리방침 변경\n\n'}

              {
                '① 이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.\n\n\n'
              }

              {'12. 개인정보의 안전성 확보 조치\n\n'}

              {
                '학생회는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다.\n\n'
              }

              {'1. 개인정보 취급 직원의 최소화 및 교육\n'}
              {
                '개인정보를 취급하는 직원을 지정하고 담당자에 한정시켜 최소화 하여 개인정보를 관리하는 대책을 시행하고 있습니다.\n\n'
              }

              {'2. 개인정보의 암호화\n'}
              {
                '이용자의 비밀번호는 단방향 암호화 되어 저장 및 관리되고 있어 본인만이 알 수 있으며, 암호화된 비밀번호를 탈취하더라도 평문으로 된 비밀번호를 알 수 없습니다.'
              }
            </Text>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.disagreeButton]}
              onPress={onClose}>
              <Text style={styles.buttonText}>동의하지 않음</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.agreeButton]}
              onPress={onAgree}>
              <Text style={[styles.buttonText, styles.agreeButtonText]}>
                동의합니다
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disagreeButton: {
    backgroundColor: '#F3F4F6',
  },
  agreeButton: {
    backgroundColor: '#4F46E5',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  agreeButtonText: {
    color: '#FFFFFF',
  },
});

export default PrivacyPolicy;
