const User = require('../models/User');

async function testUserModel() {
  try {
    console.log('Testing User model...');

    // 테스트 사용자 생성
    const testUser = await User.create({
      email: 'test@example.com',
      password: 'testpassword123',
      username: 'testuser'
    });
    console.log('User created:', testUser);
    
    // 사용자 조회 테스트
    const foundUser = await User.findByEmail('test@example.com');
    console.log('User found:', foundUser);
    
    // 비밀번호 검증 테스트
    const isValid = await User.verifyPassword('testpassword123', foundUser.password);
    console.log('Password verification:', isValid);
    
    // **테스트 사용자 삭제**
    await User.deleteByEmail('test@example.com');
    console.log('Test user deleted.');


    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUserModel();
