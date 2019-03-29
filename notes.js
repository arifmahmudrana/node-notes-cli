const path = require('path');
const uuidv4 = require('uuid/v4');
const fs = require('fs');
const FILE_PATH = path.join(__dirname, 'data', 'note.json');

const readFile = () =>
  new Promise(res => {
    fs.readFile(FILE_PATH, (err, data = '[]') => res(data));
  });

const writeFile = data =>
  new Promise((res, rej) => {
    fs.writeFile(FILE_PATH, data, err => {
      if (err) {
        return rej(err);
      }

      res();
    });
  });

const parse = data => {
  try {
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const add = (title, body) => {
  const id = uuidv4(),
    note = {
      id,
      title,
      body
    };
  return readFile()
    .then(parse)
    .then(data => {
      if (data.find(i => i.title === title)) {
        throw new Error('Note has duplicate title');
      }

      return data;
    })
    .then(data => [...data, note])
    .then(data => JSON.stringify(data, null, 2))
    .then(writeFile)
    .then(() => id)
    .catch(err => {
      throw err;
    });
};

const list = () =>
  readFile()
    .then(parse)
    .catch(err => {
      throw err;
    });

const read = (val, isTitle = false, isFirst = false, isLast = false) =>
  list().then(data =>
    isFirst
      ? data[0]
      : isLast
      ? data[data.length - 1]
      : data.find(i => (isTitle ? i.title === val : i.id === val))
  );

const remove = (val, isTitle = false, isFirst = false, isLast = false) =>
  list()
    .then(data =>
      isFirst
        ? data.slice(1)
        : isLast
        ? data.slice(0, -1)
        : data.filter(i => (!isTitle ? i.id !== val : i.title !== val))
    )
    .then(data => JSON.stringify(data, null, 2))
    .then(writeFile)
    .catch(err => {
      throw err;
    });

module.exports = {
  add,
  list,
  read,
  remove
};
