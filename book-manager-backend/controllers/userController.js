const User = require('../models/User');
const bcrypt = require('bcrypt');

// 내 정보 조회
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: '사용자 정보를 불러오는 중 오류가 발생했습니다.'
    });
  }
};

// 프로필 수정
const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    // 사용자명 중복 체크 (자신 제외)
    if (username) {
      const existingUser = await User.findByUsername(username);
      if (existingUser && existingUser.id != userId) {
        return res.status(409).json({
          success: false,
          message: '이미 사용 중인 사용자명입니다.'
        });
      }
    }

    const updatedUser = await User.updateProfile(userId, { username });

    res.json({
      success: true,
      message: '프로필이 업데이트되었습니다.',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: '프로필 업데이트 중 오류가 발생했습니다.'
    });
  }
};

// 비밀번호 변경
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // 현재 비밀번호 확인
    const user = await User.findById(userId);
    const isCurrentPasswordValid = await User.verifyPassword(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '현재 비밀번호가 올바르지 않습니다.'
      });
    }

    // 새 비밀번호 검증
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: '새 비밀번호는 최소 6자, 영문과 숫자를 포함해야 합니다.'
      });
    }

    // 비밀번호 업데이트
    await User.updatePassword(userId, newPassword);

    res.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: '비밀번호 변경 중 오류가 발생했습니다.'
    });
  }
};


module.exports = { getMyProfile, updateProfile, changePassword };