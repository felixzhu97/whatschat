"use client";

import { useState, useRef, useCallback } from "react";
import { ArrowLeft, ImageIcon, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/presentation/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/presentation/components/ui/avatar";
import { styled } from "@/src/shared/utils/emotion";
import { useTranslation } from "@/src/shared/i18n";

const BORDER = "1px solid rgb(219 219 219)";
const TEXT_PRIMARY = "rgb(38 38 38)";
const TEXT_SECONDARY = "rgb(142 142 142)";
const BLUE = "rgb(0 149 246)";

const ModalBox = styled.div<{ $step: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: ${(p: { $step: string }) => (p.$step === "select" || p.$step === "sharing" || p.$step === "success" ? "center" : "stretch")};
  width: ${(p: { $step: string }) => (p.$step === "caption" ? "90vw" : "500px")};
  max-width: ${(p: { $step: string }) => (p.$step === "caption" ? "936px" : "500px")};
  height: ${(p: { $step: string }) => (p.$step === "caption" ? "85vh" : "520px")};
  max-height: ${(p: { $step: string }) => (p.$step === "caption" ? "800px" : "520px")};
  background: rgb(255 255 255);
  border-radius: 12px;
  overflow: hidden;
`;

const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 16px;
  padding-right: 56px;
  border-bottom: ${BORDER};
  flex-shrink: 0;
`;

const BackBtn = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: ${TEXT_PRIMARY};
`;

const HeaderTitle = styled.span`
  font-weight: 600;
  font-size: 16px;
  color: ${TEXT_PRIMARY};
`;

const HeaderAction = styled.button`
  background: none;
  border: none;
  padding: 8px 12px;
  margin: -8px -12px -8px 0;
  font-weight: 600;
  font-size: 14px;
  color: ${BLUE};
  cursor: pointer;
  border-radius: 8px;
  &:hover {
    background: rgb(239 239 239);
  }
  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

const SelectContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 24px;
  width: 100%;
`;

const DragIconWrap = styled.div`
  margin-bottom: 24px;
  color: ${TEXT_SECONDARY};
`;

const DragHint = styled.p`
  font-size: 20px;
  color: ${TEXT_PRIMARY};
  margin: 0 0 24px;
`;

const SelectBtn = styled.label`
  display: inline-block;
  padding: 8px 16px;
  background: ${BLUE};
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  input {
    display: none;
  }
`;

const CropContent = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: rgb(0 0 0);
`;

const CropImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const CaptionLayout = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

const CaptionLeft = styled.div`
  flex: 1;
  min-width: 0;
  background: rgb(0 0 0);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CaptionImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const CaptionRight = styled.div`
  width: 340px;
  min-width: 340px;
  display: flex;
  flex-direction: column;
  border-left: ${BORDER};
`;

const CaptionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: ${BORDER};
`;

const CaptionTextareaWrap = styled.div`
  padding: 16px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const CaptionTextarea = styled.textarea`
  width: 100%;
  flex: 1;
  min-height: 80px;
  border: none;
  resize: none;
  font-size: 14px;
  color: ${TEXT_PRIMARY};
  outline: none;
  &::placeholder {
    color: ${TEXT_SECONDARY};
  }
`;

const CharCount = styled.span`
  font-size: 12px;
  color: ${TEXT_SECONDARY};
  align-self: flex-end;
  margin-top: 4px;
`;

const AddOption = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  font-size: 14px;
  color: ${TEXT_PRIMARY};
  cursor: pointer;
  text-align: left;
`;

const CenterStepContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 24px;
`;

const StepTitle = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: ${TEXT_PRIMARY};
`;

const SpinnerWrap = styled.div`
  color: ${TEXT_SECONDARY};
  animation: spin 0.8s linear infinite;
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const CheckCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgb(255 100 80), rgb(200 80 180), rgb(100 100 255));
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SuccessMessage = styled.p`
  margin: 0;
  font-size: 15px;
  color: ${TEXT_SECONDARY};
  text-align: center;
`;

const StepActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 280px;
`;

const StepBtn = styled.button`
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: ${BLUE};
  color: white;
  &:hover {
    opacity: 0.9;
  }
  &:last-of-type {
    background: transparent;
    color: ${TEXT_SECONDARY};
  }
`;

const MAX_CAPTION = 2200;

interface CreatePostDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (caption: string, mediaUrls?: string[], type?: string) => void | Promise<void>;
  currentUser?: { avatar?: string; username?: string } | null;
}

export function CreatePostDialog({
  open,
  onClose,
  onSubmit,
  currentUser,
}: CreatePostDialogProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<"select" | "crop" | "caption" | "sharing" | "success">("select");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep("select");
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCaption("");
  }, [previewUrl]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const handleFileSelect = useCallback(
    (f: File | null) => {
      if (!f) return;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setStep("crop");
    },
    [previewUrl]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      if (f && (f.type.startsWith("image/") || f.type.startsWith("video/"))) handleFileSelect(f);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  const handleSelectClick = () => fileInputRef.current?.click();

  const handleCropNext = () => setStep("caption");

  const handleShare = useCallback(async () => {
    const trimmed = caption.trim();
    setStep("sharing");
    try {
      if (file) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const postType = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";
        await Promise.resolve(onSubmit(trimmed || "", [dataUrl], postType));
      } else {
        await Promise.resolve(onSubmit(trimmed || "", [], "TEXT"));
      }
      setStep("success");
    } catch {
      setStep("caption");
    }
  }, [caption, file, onSubmit]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => !o && handleClose()}>
      <DialogContent
        hideClose
        accessibleTitle={t("createPost.title")}
        style={{
          maxWidth: "none",
          width: "auto",
          padding: 0,
          gap: 0,
          border: "none",
          borderRadius: "12px",
        }}
      >
        <ModalBox $step={step}>
          {step === "select" && (
            <>
              <HeaderBar>
                <span style={{ width: 40 }} />
                <HeaderTitle>{t("createPost.title")}</HeaderTitle>
                <span style={{ width: 40 }} />
              </HeaderBar>
              <SelectContent
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{ cursor: "default" }}
              >
                <DragIconWrap>
                  <ImageIcon size={96} strokeWidth={0.5} />
                </DragIconWrap>
                <DragHint>{t("createPost.dragHint")}</DragHint>
                <SelectBtn>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                  />
                  {t("createPost.selectFromComputer")}
                </SelectBtn>
              </SelectContent>
            </>
          )}

          {step === "crop" && (
            <>
              <HeaderBar>
                <BackBtn
                  type="button"
                  onClick={() => {
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                    setFile(null);
                    setStep("select");
                  }}
                >
                  <ArrowLeft size={24} />
                </BackBtn>
                <HeaderTitle>{t("createPost.crop")}</HeaderTitle>
                <HeaderAction type="button" onClick={handleCropNext}>
                  {t("createPost.next")}
                </HeaderAction>
              </HeaderBar>
              <CropContent>
                {previewUrl &&
                  (file?.type.startsWith("video/") ? (
                    <video src={previewUrl} controls style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  ) : (
                    <CropImage src={previewUrl} alt="" />
                  ))}
              </CropContent>
            </>
          )}

          {step === "caption" && (
            <>
              <HeaderBar>
                <BackBtn type="button" onClick={() => setStep("crop")}>
                  <ArrowLeft size={24} />
                </BackBtn>
                <HeaderTitle>{t("createPost.title")}</HeaderTitle>
                <HeaderAction type="button" onClick={handleShare}>
                  {t("createPost.share")}
                </HeaderAction>
              </HeaderBar>
              <CaptionLayout style={{ flex: 1, minHeight: 0 }}>
                <CaptionLeft>
                  {previewUrl &&
                    (file?.type.startsWith("video/") ? (
                      <video
                        src={previewUrl}
                        muted
                        loop
                        playsInline
                        style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
                      />
                    ) : (
                      <CaptionImage src={previewUrl} alt="" />
                    ))}
                </CaptionLeft>
                <CaptionRight>
                  <CaptionHeader>
                    {currentUser && (
                      <Avatar style={{ width: 32, height: 32 }}>
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback>{(currentUser.username || "?")[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{currentUser?.username ?? ""}</span>
                  </CaptionHeader>
                  <CaptionTextareaWrap>
                    <CaptionTextarea
                      placeholder={t("createPost.captionPlaceholder")}
                      value={caption}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setCaption(e.target.value.slice(0, MAX_CAPTION))
                      }
                      maxLength={MAX_CAPTION}
                    />
                    <CharCount>{t("createPost.charCount", { current: String(caption.length) } as Record<string, string>)}</CharCount>
                  </CaptionTextareaWrap>
                  <AddOption type="button">{t("createPost.addLocation")}</AddOption>
                  <AddOption type="button">{t("createPost.addCollaborators")}</AddOption>
                </CaptionRight>
              </CaptionLayout>
            </>
          )}

          {step === "sharing" && (
            <CenterStepContent>
              <StepTitle>{t("createPost.sharing")}</StepTitle>
              <SpinnerWrap>
                <Loader2 size={48} strokeWidth={2} />
              </SpinnerWrap>
            </CenterStepContent>
          )}

          {step === "success" && (
            <CenterStepContent>
              <StepTitle>{t("createPost.postShared")}</StepTitle>
              <CheckCircle>
                <Check size={40} color="white" strokeWidth={3} />
              </CheckCircle>
              <SuccessMessage>{t("createPost.postSharedMessage")}</SuccessMessage>
              <StepActions>
                <StepBtn type="button" onClick={handleClose}>
                  {t("createPost.viewPost")}
                </StepBtn>
                <StepBtn type="button" onClick={reset}>
                  {t("createPost.createAnother")}
                </StepBtn>
                <StepBtn type="button" onClick={handleClose}>
                  {t("createPost.done")}
                </StepBtn>
              </StepActions>
            </CenterStepContent>
          )}
        </ModalBox>
      </DialogContent>
    </Dialog>
  );
}
