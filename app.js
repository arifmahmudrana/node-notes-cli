// const fs = require('fs');

// fs.writeFileSync('notes.txt', 'Welcome to class!');
// fs.appendFileSync('notes.txt', `\nText appended`);
// const chalk = require('chalk');

const yargonaut = require('yargonaut');
const Table = require('cli-table');

const chalk = yargonaut.chalk();
const notes = require('./notes');

// console.log('====================================');
// console.log(chalk.green.underline.bold.inverse(notes.getNotes()));
// console.log(chalk.green.underline.bold(notes.getNotes()));
// console.log(chalk.white.bgGreen.underline.bold(notes.getNotes()));
// console.log(chalk.italic.strikethrough(notes.getNotes()));
// console.log(chalk.italic(notes.getNotes()));
// console.log('====================================');

yargonaut
  .style('blue')
  .style('yellow', 'required')
  .helpStyle('green')
  .errorsStyle('red.bold');

const builder = yargs => {
  yargs
    .option('id', {
      describe: 'ID of note',
      string: true
    })
    .option('title', {
      alias: 't',
      describe: 'Title of note',
      string: true
    })
    .option('first', {
      alias: 'f',
      describe: 'First note',
      boolean: true
    })
    .option('last', {
      alias: 'l',
      describe: 'Last note',
      boolean: true
    })
    .check(({ id, title, first, last }) => {
      if (!id && !title && !first && !last) {
        throw new Error(
          chalk.red.bold('must provide id or title or first or last')
        );
      }

      if (id && !id.trim()) {
        throw new Error(chalk.red.bold('id is empty'));
      }

      if (title && !title.trim()) {
        throw new Error(chalk.red.bold('title is empty'));
      }

      if (first && last) {
        throw new Error(
          chalk.red.bold("either set first or last can't set both")
        );
      }

      return true;
    });
};

const errorFunc = err => {
  console.log(chalk.red.bold(`You have error:`), `\n${err.message}`);
};

const printTable = data => {
  const table = new Table({
    head: ['#', 'Title', 'Body'].map(i => chalk.yellow(i))
  });

  data.forEach(i => table.push([i.id, i.title, i.body]));
  console.log(table.toString());
};

require('yargs')
  .usage('Usage: $0 <cmd> [options]')
  .command({
    command: 'add <title> <body>',
    desc: 'Add a note',
    builder(yargs) {
      yargs
        .string('title')
        .string('body')
        .check(({ title, body }) => {
          if (!title.trim()) {
            throw new Error(chalk.red.bold('title is empty'));
          }

          if (!body.trim()) {
            throw new Error(chalk.red.bold('body is empty'));
          }

          return true;
        });
    },
    handler(argv) {
      notes
        .add(argv.title, argv.body)
        .then(id => console.log(chalk.green(`Note saved. Note id ${id}`)))
        .catch(errorFunc);
    }
  })
  .command({
    command: 'remove',
    desc: 'Remove a note',
    builder,
    handler(argv) {
      let prom;
      if (argv.id && argv.id.trim()) {
        prom = notes.remove(argv.id.trim());
      } else if (argv.title && argv.title.trim()) {
        prom = notes.remove(argv.title.trim(), true);
      } else if (argv.first) {
        prom = notes.remove(undefined, undefined, true);
      } else if (argv.last) {
        prom = notes.remove(undefined, undefined, undefined, true);
      }
      if (prom) {
        prom
          .then(() => console.log(chalk.green(`Note removed ${argv.id}`)))
          .catch(errorFunc);
      }
    }
  })
  .command({
    command: 'read',
    desc: 'Read a note',
    builder,
    handler(argv) {
      let prom;
      if (argv.id && argv.id.trim()) {
        prom = notes.read(argv.id.trim());
      } else if (argv.title && argv.title.trim()) {
        prom = notes.read(argv.title.trim(), true);
      } else if (argv.first) {
        prom = notes.read(undefined, undefined, true);
      } else if (argv.last) {
        prom = notes.read(undefined, undefined, undefined, true);
      }
      if (prom) {
        prom
          .then(data => {
            if (!data) throw new Error('Note not found!!');
            return [data];
          })
          .then(printTable)
          .catch(errorFunc);
      }
    }
  })
  .command({
    command: 'list',
    desc: 'List all notes',
    builder(yargs) {},
    handler(argv) {
      notes
        .list()
        .then(printTable)
        .catch(errorFunc);
    }
  })
  .demandCommand(
    1,
    chalk.red.bold('You need at least one command before moving on')
  )
  .help()
  .alias('help', 'h')
  .alias('version', 'v')
  .strict().argv;
