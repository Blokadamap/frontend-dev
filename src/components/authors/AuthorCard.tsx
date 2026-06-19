import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import type { AuthorDetailed } from "../../types/author/author.type";
import { formatAuthorName, formatLifeDates } from "../../utils/authorDisplay";

/**
 * Карточка автора в списке. Пока показываем только ФИО, даты жизни и фото.
 * Фото и дата смерти в БД отсутствуют — на их месте заглушки.
 * Клик в любую точку карточки открывает страницу автора.
 */
function AuthorCard({ author }: { author: AuthorDetailed }) {
  const navigate = useNavigate();
  const lifeDates = formatLifeDates(author.birthDate, author.deathDate ?? null);

  return (
    <button
      type="button"
      className="author-card"
      onClick={() => navigate(`/authors/${author.authorId}`)}
    >
      {author.photo ? (
        <span className="author-card__photo author-card__photo--filled">
          <img src={author.photo} alt={`Фотография: ${formatAuthorName(author)}`} />
        </span>
      ) : (
        <span className="author-card__photo" aria-hidden="true">
          <User size={28} strokeWidth={1.5} />
        </span>
      )}

      <span className="author-card__body">
        <span className="author-card__name">{formatAuthorName(author)}</span>
        {lifeDates && <span className="author-card__dates">{lifeDates}</span>}
      </span>
    </button>
  );
}

export default AuthorCard;
