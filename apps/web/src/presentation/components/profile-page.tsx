"use client";

import { useState } from "react";
import { ArrowLeft, Camera, Edit2, Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/presentation/components/ui/avatar";
import { Button } from "@/src/presentation/components/ui/button";
import { Input } from "@/src/presentation/components/ui/input";
import { Label } from "@/src/presentation/components/ui/label";
import { ScrollArea } from "@/src/presentation/components/ui/scroll-area";
import { Separator } from "@/src/presentation/components/ui/separator";
import { styled } from "@/src/shared/utils/emotion";
import { useAuth } from "../hooks/use-auth";

interface ProfilePageProps {
  onBack: () => void;
}

const PageRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
`;

const Header = styled.div`
  background-color: #16a34a;
  color: white;
  padding: 1rem;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackBtn = styled(Button)`
  color: white;

  &:hover {
    background-color: #15803d;
  }
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 500;
`;

const ArrowIcon = styled(ArrowLeft)`
  height: 1.25rem;
  width: 1.25rem;
`;

const Body = styled(ScrollArea)`
  flex: 1;
`;

const Inner = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const AvatarWrap = styled.div`
  position: relative;
`;

const AvatarLarge = styled(Avatar)`
  height: 8rem;
  width: 8rem;
`;

const FallbackLarge = styled(AvatarFallback)`
  font-size: 1.5rem;
`;

const CameraBtn = styled(Button)`
  position: absolute;
  bottom: 0;
  right: 0;
  border-radius: 9999px;
  background-color: #22c55e;

  &:hover {
    background-color: #16a34a;
  }
`;

const CameraIcon = styled(Camera)`
  height: 1rem;
  width: 1rem;
`;

const AvatarHint = styled.p`
  font-size: 0.875rem;
  color: rgb(75 85 99);
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const LabelGreen = styled(Label)`
  color: #16a34a;
  font-weight: 500;
`;

const EditRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InputFlex = styled(Input)`
  flex: 1;
`;

const CheckIcon = styled(Check)`
  height: 1rem;
  width: 1rem;
  color: #16a34a;
`;

const XIcon = styled(X)`
  height: 1rem;
  width: 1rem;
  color: rgb(75 85 99);
`;

const ViewRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: 0.5rem;

  &:hover {
    background-color: rgb(249 250 251);
  }
`;

const ViewText = styled.span`
  color: rgb(17 24 31);
`;

const EditIcon = styled(Edit2)`
  height: 1rem;
  width: 1rem;
  color: rgb(75 85 99);
`;

const FieldHint = styled.p`
  font-size: 0.75rem;
  color: rgb(107 114 128);
`;

const ContactGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ContactLabel = styled(Label)`
  font-size: 0.875rem;
  color: rgb(75 85 99);
`;

const ContactValue = styled.div`
  padding: 0.75rem;
  background-color: rgb(249 250 251);
  border-radius: 0.5rem;
`;

const ContactText = styled.span`
  color: rgb(17 24 31);
`;

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { user, updateUser } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [tempName, setTempName] = useState(user?.name || "");
  const [tempAbout, setTempAbout] = useState(user?.about || "");

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateUser({ name: tempName.trim() });
      setIsEditingName(false);
    }
  };

  const handleSaveAbout = () => {
    updateUser({ about: tempAbout.trim() });
    setIsEditingAbout(false);
  };

  const handleCancelName = () => {
    setTempName(user?.name || "");
    setIsEditingName(false);
  };

  const handleCancelAbout = () => {
    setTempAbout(user?.about || "");
    setIsEditingAbout(false);
  };

  return (
    <PageRoot>
      <Header>
        <HeaderRow>
          <BackBtn variant="ghost" size="icon" onClick={onBack}>
            <ArrowIcon />
          </BackBtn>
          <Title>个人资料</Title>
        </HeaderRow>
      </Header>

      <Body>
        <Inner>
          <AvatarSection>
            <AvatarWrap>
              <AvatarLarge>
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <FallbackLarge>{user?.name?.[0] || "我"}</FallbackLarge>
              </AvatarLarge>
              <CameraBtn size="icon">
                <CameraIcon />
              </CameraBtn>
            </AvatarWrap>
            <AvatarHint>点击更换头像</AvatarHint>
          </AvatarSection>

          <Separator />

          <FieldGroup>
            <LabelGreen>姓名</LabelGreen>
            {isEditingName ? (
              <EditRow>
                <InputFlex value={tempName} onChange={(e) => setTempName(e.target.value)} autoFocus />
                <Button size="icon" variant="ghost" onClick={handleSaveName}>
                  <CheckIcon />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancelName}>
                  <XIcon />
                </Button>
              </EditRow>
            ) : (
              <ViewRow>
                <ViewText>{user?.name || "未设置"}</ViewText>
                <Button size="icon" variant="ghost" onClick={() => setIsEditingName(true)}>
                  <EditIcon />
                </Button>
              </ViewRow>
            )}
            <FieldHint>这不是用户名或PIN码。此名称将对您的 Instagram 联系人可见。</FieldHint>
          </FieldGroup>

          <Separator />

          <FieldGroup>
            <LabelGreen>关于</LabelGreen>
            {isEditingAbout ? (
              <EditRow>
                <InputFlex value={tempAbout} onChange={(e) => setTempAbout(e.target.value)} autoFocus />
                <Button size="icon" variant="ghost" onClick={handleSaveAbout}>
                  <CheckIcon />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancelAbout}>
                  <XIcon />
                </Button>
              </EditRow>
            ) : (
              <ViewRow>
                <ViewText>{user?.about || "嗨，我正在使用 Instagram！"}</ViewText>
                <Button size="icon" variant="ghost" onClick={() => setIsEditingAbout(true)}>
                  <EditIcon />
                </Button>
              </ViewRow>
            )}
          </FieldGroup>

          <Separator />

          <ContactGroup>
            <LabelGreen>联系信息</LabelGreen>
            <FieldGroup>
              <div>
                <ContactLabel>邮箱</ContactLabel>
                <ContactValue>
                  <ContactText>{user?.email || "未设置"}</ContactText>
                </ContactValue>
              </div>
              <div>
                <ContactLabel>手机号</ContactLabel>
                <ContactValue>
                  <ContactText>{user?.phone || "未设置"}</ContactText>
                </ContactValue>
              </div>
            </FieldGroup>
          </ContactGroup>
        </Inner>
      </Body>
    </PageRoot>
  );
}
