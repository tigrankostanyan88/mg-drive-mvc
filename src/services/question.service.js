const cache = require('../utils/cache');
const AppError = require('../utils/appError');
const dbCon = require('../utils/db');
const repo = require('../repositories/questionRepository');
const Files = require('../controllers/File');
const { QUESTIONS_ALL_KEY } = require('../constants/cache');

async function add(body, files) {
  const t = await dbCon.con.transaction();
  try {
    const options = JSON.parse(body.options);
    if (!body.row_id) throw new AppError('Պարտադիր ընտրեք թեստ կամ խումբ', 403);
    if (!body.question) throw new AppError('Հարցի դաշտը չի կարող դատարկ լինել', 403);
    if (!options.length) throw new AppError('Պարտադիր է ավելացնել պատասխաններ', 403);
    if (body.correctAnswerIndex === undefined) throw new AppError('Ընտրեք ճիշտ պատասխանը', 403);

    const question = await repo.create(body, t);
    if (files?.question_img) {
      await question.reload({ include: 'files', transaction: t });
      const image = await new Files(question, files.question_img).replace('question_img');
      if (image.status !== 'success') {
        const msg = typeof image.message === 'object' ? Object.values(image.message).join(' ') : image.message;
        throw new AppError(msg, 400);
      }
      await question.createFile({ ...image.table, row_id: question.id }, { transaction: t });
    }
    await t.commit();
    await cache.del(QUESTIONS_ALL_KEY);
    const full = await repo.findByIdWithFiles(question.id);
    return full;
  } catch (e) {
    try { await t.rollback(); } catch {}
    throw e instanceof AppError ? e : new AppError('Internal server error', 500);
  }
}

async function listNormalized() {
  const cached = await cache.get(QUESTIONS_ALL_KEY);
  if (cached) return { questions: cached, fromCache: true };
  const questions = await repo.findAllBasic();
  const tests = await repo.findAllTests();
  const groups = await repo.findAllGroups();
  const testMap = Object.fromEntries(tests.map(t => [t.id, t]));
  const groupMap = Object.fromEntries(groups.map(g => [g.id, g]));
  const normalized = questions.map(q => {
    const owner = q.table_name === 'tests' ? { type: 'test', data: testMap[q.row_id] } : (q.table_name === 'groups' ? { type: 'group', data: groupMap[q.row_id] } : null);
    let options;
    try { options = JSON.parse(q.options); } catch { options = []; }
    return { id: q.id, question: q.question, options, row_id: q.row_id, table_name: q.table_name, correctAnswerIndex: q.correctAnswerIndex, owner };
  });
  await cache.set(QUESTIONS_ALL_KEY, normalized, 60);
  return { questions: normalized, fromCache: false };
}

async function update(id, body, files) {
  const question = await repo.findByIdWithFiles(id);
  if (!question) throw new AppError('question is not found.', 404);
  for (let key in body) question[key] = body[key];
  await repo.save(question);
  if (files?.question_img) {
    const image = await new Files(question, files.question_img).replace('question_img');
    if (image.status !== 'success') {
      const msg = typeof image.message === 'object' ? Object.values(image.message).join(' ') : image.message;
      throw new AppError(msg, 400);
    }
    await question.createFile(image.table);
  }
  await cache.del(QUESTIONS_ALL_KEY);
  return question;
}

async function remove(id) {
  const question = await repo.findByIdWithFiles(id);
  if (!question) throw new AppError('Question not found.', 404);
  const file = await repo.findFileByRowId(question.id);
  await repo.destroyById(question.id);
  if (file) await repo.destroyFileById(file.id);
  await cache.del(QUESTIONS_ALL_KEY);
  return true;
}

module.exports = { add, listNormalized, update, remove };
