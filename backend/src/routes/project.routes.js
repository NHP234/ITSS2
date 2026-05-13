const { Router } = require('express');
const project = require('../controllers/project.controller');

const router = Router();

// GET    /api/projects
router.get('/', project.getAll);

// GET    /api/projects/:id
router.get('/:id', project.getOne);

// POST   /api/projects
router.post('/', project.create);

// PUT    /api/projects/:id
router.put('/:id', project.update);

// DELETE /api/projects/:id
router.delete('/:id', project.remove);

// POST   /api/projects/:id/members
router.post('/:id/members', project.addMember);

// DELETE /api/projects/:id/members/:userId
router.delete('/:id/members/:userId', project.removeMember);

// POST   /api/projects/:id/links
router.post('/:id/links', project.addLink);

// DELETE /api/projects/:id/links/:linkId
router.delete('/:id/links/:linkId', project.removeLink);

module.exports = router;
