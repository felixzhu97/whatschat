import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../themes/app_theme.dart';

class ChatInputField extends StatefulWidget {
  final TextEditingController controller;
  final Function(String) onSend;

  const ChatInputField({
    super.key,
    required this.controller,
    required this.onSend,
  });

  @override
  State<ChatInputField> createState() => _ChatInputFieldState();
}

class _ChatInputFieldState extends State<ChatInputField> {
  bool _showAttachmentMenu = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        children: [
          if (_showAttachmentMenu) _buildAttachmentMenu(),
          Row(
            children: [
              // 附件按钮
              CupertinoButton(
                padding: EdgeInsets.zero,
                onPressed: () {
                  setState(() {
                    _showAttachmentMenu = !_showAttachmentMenu;
                  });
                },
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: _showAttachmentMenu
                        ? AppTheme.primaryGreen.withValues(alpha: 0.1)
                        : Colors.transparent,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    _showAttachmentMenu
                        ? CupertinoIcons.xmark
                        : CupertinoIcons.plus,
                    color: AppTheme.primaryGreen,
                    size: 20,
                  ),
                ),
              ),

              const SizedBox(width: 8),

              // 输入框
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: CupertinoTheme.of(context).barBackgroundColor,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: CupertinoColors.separator,
                      width: 0.5,
                    ),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: CupertinoTextField(
                          controller: widget.controller,
                          placeholder: '消息',
                          placeholderStyle: const TextStyle(
                            color: CupertinoColors.placeholderText,
                          ),
                          style: CupertinoTheme.of(context).textTheme.textStyle,
                          decoration: const BoxDecoration(),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 10,
                          ),
                          maxLines: 5,
                          minLines: 1,
                          textInputAction: TextInputAction.send,
                          onSubmitted: (text) => _sendMessage(),
                        ),
                      ),
                      CupertinoButton(
                        padding: const EdgeInsets.only(right: 8),
                        minSize: 0,
                        onPressed: () {
                          _showEmojiPicker();
                        },
                        child: const Icon(
                          CupertinoIcons.smiley,
                          color: CupertinoColors.systemGrey,
                          size: 24,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(width: 8),

              // 发送/语音按钮
              CupertinoButton(
                padding: EdgeInsets.zero,
                onPressed: () {
                  if (widget.controller.text.trim().isNotEmpty) {
                    _sendMessage();
                  } else {
                    _recordVoice();
                  }
                },
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: const BoxDecoration(
                    color: AppTheme.primaryGreen,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    widget.controller.text.trim().isNotEmpty
                        ? CupertinoIcons.paperplane_fill
                        : CupertinoIcons.mic_fill,
                    color: Colors.white,
                    size: 18,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAttachmentMenu() {
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: CupertinoTheme.of(context).barBackgroundColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: CupertinoColors.separator,
          width: 0.5,
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildAttachmentButton(
                icon: CupertinoIcons.camera_fill,
                label: '相机',
                color: AppTheme.iosBlue,
                onPressed: () => _takePicture(),
              ),
              _buildAttachmentButton(
                icon: CupertinoIcons.photo_fill,
                label: '相册',
                color: AppTheme.iosGreen,
                onPressed: () => _pickFromGallery(),
              ),
              _buildAttachmentButton(
                icon: CupertinoIcons.doc_fill,
                label: '文件',
                color: AppTheme.iosPurple,
                onPressed: () => _pickDocument(),
              ),
              _buildAttachmentButton(
                icon: CupertinoIcons.location_fill,
                label: '位置',
                color: AppTheme.iosRed,
                onPressed: () => _shareLocation(),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildAttachmentButton(
                icon: CupertinoIcons.person_fill,
                label: '联系人',
                color: AppTheme.iosBlue,
                onPressed: () => _sendContact(),
              ),
              _buildAttachmentButton(
                icon: CupertinoIcons.videocam_fill,
                label: '视频',
                color: AppTheme.iosOrange,
                onPressed: () => _recordVideo(),
              ),
              _buildAttachmentButton(
                icon: CupertinoIcons.chart_bar_fill,
                label: '投票',
                color: AppTheme.iosTeal,
                onPressed: () => _createPoll(),
              ),
              _buildAttachmentButton(
                icon: CupertinoIcons.gift_fill,
                label: '红包',
                color: AppTheme.iosRed,
                onPressed: () => _sendRedPacket(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAttachmentButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: onPressed,
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              color: Colors.white,
              size: 24,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: CupertinoColors.systemGrey,
            ),
          ),
        ],
      ),
    );
  }

  void _sendMessage() {
    final text = widget.controller.text.trim();
    if (text.isNotEmpty) {
      widget.onSend(text);
      widget.controller.clear();
    }
  }

  void _recordVoice() {
    // 显示录音界面
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: const Text('录制语音'),
        message: const Text('按住录音，松开发送'),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _showComingSoon('录制语音');
            },
            child: const Text('开始录音'),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(context),
          child: const Text('取消'),
        ),
      ),
    );
  }

  void _showEmojiPicker() {
    _showComingSoon('表情符号选择器');
  }

  void _takePicture() {
    setState(() {
      _showAttachmentMenu = false;
    });
    _showComingSoon('拍照');
  }

  void _pickFromGallery() {
    setState(() {
      _showAttachmentMenu = false;
    });
    _showComingSoon('从相册选择');
  }

  void _pickDocument() {
    setState(() {
      _showAttachmentMenu = false;
    });
    _showComingSoon('选择文件');
  }

  void _shareLocation() {
    setState(() {
      _showAttachmentMenu = false;
    });
    _showComingSoon('分享位置');
  }

  void _recordVideo() {
    setState(() {
      _showAttachmentMenu = false;
    });
    _showComingSoon('录制视频');
  }

  void _sendContact() {
    setState(() {
      _showAttachmentMenu = false;
    });
    _showComingSoon('发送联系人');
  }

  void _createPoll() {
    setState(() {
      _showAttachmentMenu = false;
    });
    _showComingSoon('创建投票');
  }

  void _sendRedPacket() {
    setState(() {
      _showAttachmentMenu = false;
    });
    _showComingSoon('发送红包');
  }

  void _showComingSoon(String feature) {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('功能待实现'),
        content: Text('$feature功能正在开发中，敬请期待！'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }
}
