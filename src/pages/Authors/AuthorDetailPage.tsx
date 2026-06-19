import { useParams, Link } from "react-router-dom";
import { User, ArrowLeft } from "lucide-react";
import { useAuthorById } from "../../hooks/authors/useAuthorById";
import { useDiaryByAuthor } from "../../hooks/diaries/useDiaryByAuthor";
import type { FilterItem } from "../../types/common/common.types";
import {
  formatAuthorName,
  formatDottedDate,
  formatLifeDates,
} from "../../utils/authorDisplay";
import "./AuthorDetailPage.css";

const names = (items?: FilterItem[]) =>
  (items ?? []).map((i) => i.name).filter(Boolean).join(", ");

function AuthorDetailPage() {
  const { id = "" } = useParams();
  const { data: author, isLoading, isError } = useAuthorById(id);
  const { data: diary } = useDiaryByAuthor(author?.authorId);

  if (isLoading) {
    return (
      <div className="author-detail-page paper-map-bg">
        <div className="author-detail">
          <p className="authors-status">Загружаем данные автора…</p>
        </div>
      </div>
    );
  }

  if (isError || !author) {
    return (
      <div className="author-detail-page paper-map-bg">
        <div className="author-detail">
          <p className="authors-status">Не удалось загрузить автора.</p>
          <Link to="/authors" className="author-detail__back">
            <ArrowLeft size={18} /> К списку авторов
          </Link>
        </div>
      </div>
    );
  }

  // Все известные данные об авторе → теги.
  const tags: string[] = [];
  tags.push(`Пол: ${author.sex === "M" ? "мужской" : "женский"}`);
  if (author.familyStatus?.name)
    tags.push(`Семейное положение: ${author.familyStatus.name}`);
  tags.push(`Дети: ${author.hasChildren ? "есть" : "нет"}`);
  if (names(author.nationalities))
    tags.push(`Национальность: ${names(author.nationalities)}`);
  if (names(author.socialClasses))
    tags.push(`Социальное происхождение: ${names(author.socialClasses)}`);
  if (names(author.education))
    tags.push(`Образование: ${names(author.education)}`);
  if (names(author.occupation))
    tags.push(`Тип деятельности: ${names(author.occupation)}`);
  if (names(author.politicalParties))
    tags.push(`Партийность: ${names(author.politicalParties)}`);
  if (names(author.religions))
    tags.push(`Религия: ${names(author.religions)}`);
  if (names(author.cards)) tags.push(`Тип карточки: ${names(author.cards)}`);

  const lifeDates = formatLifeDates(author.birthDate, author.deathDate ?? null);

  const diaryPeriod =
    diary && (diary.startedAt || diary.finishedAt)
      ? [formatDottedDate(diary.startedAt), formatDottedDate(diary.finishedAt)]
          .filter(Boolean)
          .join(" — ")
      : "";
  const hasDiaryInfo =
    !!diary &&
    (!!diaryPeriod ||
      !!diary.diarySource?.trim() ||
      !!diary.diaryStoragePlace?.trim());

  return (
    <div className="author-detail-page paper-map-bg">
      <article className="author-detail">
        <Link to="/authors" className="author-detail__back">
          <ArrowLeft size={18} /> К списку авторов
        </Link>

        <div className="author-detail__head">
          {author.photo ? (
            <div className="author-detail__photo author-detail__photo--filled">
              <img src={author.photo} alt={`Фотография: ${formatAuthorName(author)}`} />
            </div>
          ) : (
            <div className="author-detail__photo" aria-hidden="true">
              <User size={56} strokeWidth={1.25} />
            </div>
          )}

          <div className="author-detail__info">
            <h1 className="author-detail__name">{formatAuthorName(author)}</h1>
            {lifeDates && <p className="author-detail__dates">{lifeDates}</p>}

            {tags.length > 0 && (
              <div className="author-detail__tags">
                {tags.map((t) => (
                  <span key={t} className="author-detail__tag">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <section className="author-detail__bio">
          <h2>Биография</h2>
          {author.biography?.trim() ? (
            <p>{author.biography}</p>
          ) : (
            <p className="author-detail__bio-empty">Биография пока не добавлена.</p>
          )}
        </section>

        {hasDiaryInfo && (
          <section className="author-detail__diary">
            <h2>Дневник</h2>
            <dl className="author-detail__facts">
              {diaryPeriod && (
                <div className="author-detail__fact">
                  <dt>Период ведения</dt>
                  <dd>{diaryPeriod}</dd>
                </div>
              )}
              {diary?.diarySource?.trim() && (
                <div className="author-detail__fact">
                  <dt>Публикация</dt>
                  <dd>{diary.diarySource}</dd>
                </div>
              )}
              {diary?.diaryStoragePlace?.trim() && (
                <div className="author-detail__fact">
                  <dt>Место хранения</dt>
                  <dd>{diary.diaryStoragePlace}</dd>
                </div>
              )}
            </dl>
          </section>
        )}
      </article>
    </div>
  );
}

export default AuthorDetailPage;
