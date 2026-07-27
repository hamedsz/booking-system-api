import MentorRepository from '../repositories/MentorRepository';

class MentorService {
  constructor() {
    this.mentorRepository = new MentorRepository();
  }

  listAll(opts) {
    const repo = this.getMentorRepositry(opts).withUser();

    return repo.all();
  }

  getById(id) {
    return this.mentorRepository.filterById(id).withUser().first();
  }

  getMentorRepositry(opts = {}) {
    const { page, sort } = opts || {};
    const repo = this.mentorRepository;

    if (page) {
      const { current, size } = page;
      repo.setPage(current, size);
    }

    if (sort && sort.length > 0) {
      const field = sort[0];
      const direction = sort[1] ? sort[1] : null;
      repo.sortBy(field, direction);
    } else {
      repo.sortBy('createdAt', 'DESC');
    }

    return repo;
  }
}

export default new MentorService();
