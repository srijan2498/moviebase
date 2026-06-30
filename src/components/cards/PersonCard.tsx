import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProfileUrl } from '../../utils/imageUrl';
import type { Person } from '../../api/tmdb';

interface PersonCardProps { person: Person; index?: number; }

export default function PersonCard({ person, index = 0 }: PersonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link to={`/person/${person.id}`} className="person-card">
        <div className="person-card-photo">
          <img
            src={getProfileUrl(person.profile_path, 'w185')}
            alt={person.name}
            loading="lazy"
            decoding="async"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-profile.svg'; }}
          />
        </div>
        <div className="person-card-info">
          <p className="person-card-name line-clamp-2">{person.name}</p>
          <p className="person-card-dept">{person.known_for_department}</p>
        </div>
      </Link>
    </motion.div>
  );
}
