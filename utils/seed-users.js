const db = require('../dist/db/models').default();

const userseed = require('../dist/db/seeders/20210420144709-add-users');

userseed
//  .down()
  .up()
  .then(() => {
    console.log('yay');
    process.exit();
  })
  .catch((err) => {
    console.error({ err });
    process.exit();
  });
