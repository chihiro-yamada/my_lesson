const Controller = require('./controller');

let index = 1;
const examples = [
  { id: index++, title: 'テスト1', body: 'テスト1' },
  { id: index++, title: 'テスト2', body: 'テスト2' },
];

class ExamplesController extends Controller {
  // GET /
  async index(req, res) {
    res.render('examples/index', { examples: examples });
  }

  // GET /create
  async create(req, res) {
    res.render('examples/create', { example: { title: '', body: '' } });
  }

  // POST /
  async store(req, res) {
    examples.push({ ...req.body, id: index++ });
    await req.flash('info', '保存しました');
    res.redirect('/examples/');
  }

  // GET /:id
  async show(req, res) {
    const example = examples[req.params.example - 1];
    res.render('examples/show', { example });
  }

  // GET /:id/edit
  async edit(req, res) {
    const example = examples[req.params.example - 1];
    res.render('examples/edit', { example });
  }

  // PUT or PATCH /:id
  async update(req, res) {
    examples[req.params.example - 1] = { ...examples[req.params.example - 1], ...req.body };
    await req.flash('info', '更新しました');
    res.redirect(`/examples/${req.params.example}`);
  }

  // DELETE /:id
  async destroy(req, res) {
    await req.flash('info', '削除しました（未実装）');
    res.redirect('/examples/');
  }
}

module.exports = ExamplesController;