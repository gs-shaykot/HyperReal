"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";
import {
    CheckCircle2,
    Pencil,
    ThumbsUp,
    Trash2,
    X,
} from "lucide-react";

type Review = {
    id: string;
    rating: number;
    headline: string;
    body: string;
    displayName: string;
    verifiedPurchase: boolean;
    createdAt: string;
    helpfulCount: number;
    isHelpful: boolean;
    isOwnReview: boolean;
};

type ReviewData = {
    averageRating: number;
    totalReviews: number;
    distribution: Record<number, number>;
    userHasReviewed: boolean;
    reviews: Review[];
};

type SortOption = "recent" | "helpful" | "highest" | "lowest";

type Props = {
    productId: string;
};

const LIME = "#c8ff00";

function Stars({
    value,
    interactive = false,
    onChange,
    size = 14,
}: {
    value: number;
    interactive?: boolean;
    onChange?: (value: number) => void;
    size?: number;
}) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onClick={() => onChange?.(star)}
                    aria-label={`${star} star${star === 1 ? "" : "s"}`}
                    className={`leading-none ${
                        interactive ? "cursor-pointer" : "cursor-default"
                    }`}
                >
                    <span
                        style={{
                            color: star <= value ? LIME : "#555555",
                            fontSize: size,
                        }}
                    >
                        {star <= value ? "★" : "☆"}
                    </span>
                </button>
            ))}
        </div>
    );
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
    }).format(new Date(date));
}

export default function ReviewsSection({ productId }: Props) {
    const { data: session, status: sessionStatus } = useSession();

    const [data, setData] = useState<ReviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [sort, setSort] = useState<SortOption>("recent");
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);

    const [formOpen, setFormOpen] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState<string | null>(
        null
    );
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [votingId, setVotingId] = useState<string | null>(null);

    const [rating, setRating] = useState(0);
    const [headline, setHeadline] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [body, setBody] = useState("");

    const loadReviews = useCallback(async () => {
        setLoading(true);
        setLoadError(false);

        try {
            const params = new URLSearchParams({ sort });

            if (ratingFilter) {
                params.set("rating", String(ratingFilter));
            }

            const response = await axios.get(
                `/api/products/${productId}/reviews?${params.toString()}`
            );

            setData(response.data.data);
        } catch {
            setLoadError(true);
        } finally {
            setLoading(false);
        }
    }, [productId, sort, ratingFilter]);

    useEffect(() => {
        void loadReviews();
    }, [loadReviews]);

    useEffect(() => {
        if (session?.user?.name && !displayName && !editingReviewId) {
            setDisplayName(session.user.name.slice(0, 40));
        }
    }, [session?.user?.name, displayName, editingReviewId]);

    const totalForBar = data?.totalReviews ?? 0;

    const reviewFormMessage = useMemo(() => {
        if (sessionStatus === "loading") {
            return "Checking your account...";
        }

        if (sessionStatus !== "authenticated") {
            return "Sign in to submit a review.";
        }

        if (data?.userHasReviewed) {
            return "You have already reviewed this product. You can edit or delete your review below.";
        }

        return "";
    }, [sessionStatus, data?.userHasReviewed]);

    const resetForm = () => {
        setFormOpen(false);
        setEditingReviewId(null);
        setRating(0);
        setHeadline("");
        setBody("");
        setDisplayName(session?.user?.name?.slice(0, 40) ?? "");
    };

    const openReviewForm = () => {
        if (sessionStatus !== "authenticated") {
            toast.error("Please sign in to write a review.");
            return;
        }

        if (data?.userHasReviewed) {
            toast.error("You have already reviewed this product.");
            return;
        }

        setEditingReviewId(null);
        setRating(0);
        setHeadline("");
        setBody("");
        setDisplayName(session.user?.name?.slice(0, 40) ?? "");
        setFormOpen(true);
    };

    const startEditing = (review: Review) => {
        setEditingReviewId(review.id);
        setRating(review.rating);
        setHeadline(review.headline);
        setDisplayName(review.displayName);
        setBody(review.body);
        setFormOpen(true);

        document
            .getElementById("product-review-form")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const closeReviewForm = () => {
        if (submitting) return;
        resetForm();
    };

    const submitReview = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (sessionStatus !== "authenticated") {
            toast.error("Please sign in to write a review.");
            return;
        }

        if (rating < 1 || rating > 5) {
            toast.error("Choose a star rating.");
            return;
        }

        if (!headline.trim() || !displayName.trim() || !body.trim()) {
            toast.error("Complete all review fields.");
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                rating,
                headline,
                displayName,
                body,
            };

            const response = editingReviewId
                ? await axios.patch(
                      `/api/products/${productId}/reviews/${editingReviewId}`,
                      payload
                  )
                : await axios.post(
                      `/api/products/${productId}/reviews`,
                      payload
                  );

            toast.success(
                response.data.message ||
                    (editingReviewId
                        ? "Review updated."
                        : "Review submitted.")
            );

            resetForm();
            await loadReviews();
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message
                : undefined;

            toast.error(
                message ||
                    (editingReviewId
                        ? "Could not update your review."
                        : "Could not submit your review.")
            );
        } finally {
            setSubmitting(false);
        }
    };

    const deleteReview = async (review: Review) => {
        const confirmed = window.confirm(
            `Delete your review "${review.headline}"?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        setDeletingId(review.id);

        try {
            const response = await axios.delete(
                `/api/products/${productId}/reviews/${review.id}`
            );

            toast.success(
                response.data.message || "Your review has been deleted."
            );

            if (editingReviewId === review.id) {
                resetForm();
            }

            await loadReviews();
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message
                : undefined;

            toast.error(message || "Could not delete your review.");
        } finally {
            setDeletingId(null);
        }
    };

    const toggleHelpful = async (review: Review) => {
        if (sessionStatus !== "authenticated") {
            toast.error("Please sign in to vote on reviews.");
            return;
        }

        if (review.isOwnReview) {
            toast.error("You cannot vote on your own review.");
            return;
        }

        setVotingId(review.id);

        try {
            await axios.post(
                `/api/products/${productId}/reviews/${review.id}/helpful`
            );
            await loadReviews();
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message
                : undefined;

            toast.error(message || "Could not update your vote.");
        } finally {
            setVotingId(null);
        }
    };

    return (
        <section
            id="product-reviews"
            className="mt-12 border-t border-zinc-800 pt-8 sm:mt-16 sm:pt-10"
        >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold italic tracking-wide text-white">
                    RATINGS &amp;{" "}
                    <span style={{ color: LIME }}>REVIEWS</span>
                </h2>

                {!formOpen ? (
                    <button
                        type="button"
                        onClick={openReviewForm}
                        className="bg-[#c8ff00] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wide text-black hover:brightness-95"
                    >
                        ↗ WRITE A REVIEW
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={closeReviewForm}
                        disabled={submitting}
                        className="flex items-center gap-1.5 border border-zinc-600 px-3 py-2 font-mono text-[10px] uppercase text-zinc-300 hover:border-white disabled:opacity-50"
                    >
                        <X size={12} />
                        CLOSE
                    </button>
                )}
            </div>

            {loadError ? (
                <div className="border border-zinc-800 bg-[#101010] p-5">
                    <p className="text-sm text-zinc-400">
                        Could not load reviews.
                    </p>
                    <button
                        type="button"
                        onClick={() => void loadReviews()}
                        className="mt-3 border border-zinc-700 px-3 py-2 font-mono text-[10px] text-white hover:border-[#c8ff00]"
                    >
                        TRY AGAIN
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr]">
                        <div className="flex min-h-28 flex-col items-center justify-center border border-zinc-800 bg-[#101010] p-4">
                            <strong
                                className="font-mono text-4xl leading-none"
                                style={{ color: LIME }}
                            >
                                {loading
                                    ? "—"
                                    : (data?.averageRating ?? 0).toFixed(1)}
                            </strong>

                            <div className="mt-2">
                                <Stars
                                    value={Math.round(
                                        data?.averageRating ?? 0
                                    )}
                                    size={16}
                                />
                            </div>

                            <span className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                                {data?.totalReviews ?? 0} REVIEWS
                            </span>
                        </div>

                        <div className="border border-zinc-800 bg-[#101010] p-4">
                            {[5, 4, 3, 2, 1].map((stars) => {
                                const count =
                                    data?.distribution[stars] ?? 0;

                                const percentage =
                                    totalForBar > 0
                                        ? (count / totalForBar) * 100
                                        : 0;

                                return (
                                    <button
                                        type="button"
                                        key={stars}
                                        onClick={() =>
                                            setRatingFilter((current) =>
                                                current === stars
                                                    ? null
                                                    : stars
                                            )
                                        }
                                        aria-label={`Filter ${stars} star reviews`}
                                        className={`mb-1 flex w-full items-center gap-2 text-left last:mb-0 ${
                                            ratingFilter === stars
                                                ? "opacity-100"
                                                : "opacity-80 hover:opacity-100"
                                        }`}
                                    >
                                        <span className="w-5 font-mono text-[9px] text-zinc-400">
                                            {stars}★
                                        </span>

                                        <span className="h-1.5 flex-1 overflow-hidden bg-[#292929]">
                                            <span
                                                className="block h-full"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: LIME,
                                                }}
                                            />
                                        </span>

                                        <span className="w-4 text-right font-mono text-[9px] text-zinc-500">
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}

                            <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.15em] text-zinc-600">
                                *TAP A BAR TO FILTER
                            </p>
                        </div>
                    </div>

                    {formOpen && (
                        <form
                            id="product-review-form"
                            onSubmit={submitReview}
                            className="mt-4 border border-[#364000] bg-[#111403] p-4 sm:p-5"
                        >
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#c8ff00]">
                                    {editingReviewId
                                        ? "EDIT YOUR REVIEW"
                                        : "WRITE YOUR REVIEW"}
                                </h3>

                                {editingReviewId && (
                                    <span className="font-mono text-[8px] uppercase text-zinc-500">
                                        Editing saved review
                                    </span>
                                )}
                            </div>

                            <label className="mb-2 block font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                YOUR RATING
                            </label>

                            <Stars
                                value={rating}
                                interactive
                                onChange={setRating}
                                size={25}
                            />

                            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-2 block font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                        HEADLINE
                                    </span>
                                    <input
                                        value={headline}
                                        onChange={(event) =>
                                            setHeadline(event.target.value)
                                        }
                                        maxLength={100}
                                        required
                                        placeholder="BUILT LIKE A BUNKER"
                                        className="h-9 w-full border border-zinc-800 bg-[#090909] px-3 font-mono text-[10px] text-white outline-none placeholder:text-zinc-600 focus:border-[#c8ff00]"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                        DISPLAY NAME
                                    </span>
                                    <input
                                        value={displayName}
                                        onChange={(event) =>
                                            setDisplayName(event.target.value)
                                        }
                                        maxLength={40}
                                        required
                                        placeholder="YOUR NAME"
                                        className="h-9 w-full border border-zinc-800 bg-[#090909] px-3 font-mono text-[10px] text-white outline-none placeholder:text-zinc-600 focus:border-[#c8ff00]"
                                    />
                                </label>
                            </div>

                            <label className="mt-4 block">
                                <span className="mb-2 block font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                    REVIEW
                                </span>

                                <textarea
                                    value={body}
                                    onChange={(event) =>
                                        setBody(event.target.value)
                                    }
                                    minLength={10}
                                    maxLength={3000}
                                    required
                                    rows={4}
                                    placeholder="Fit, material, durability..."
                                    className="w-full resize-y border border-zinc-800 bg-[#090909] p-3 font-mono text-[10px] leading-relaxed text-white outline-none placeholder:text-zinc-600 focus:border-[#c8ff00]"
                                />

                                <span className="mt-1 block text-right font-mono text-[9px] text-zinc-600">
                                    {body.length}/3000
                                </span>
                            </label>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-[#c8ff00] px-4 py-2.5 font-mono text-[9px] font-bold uppercase tracking-wide text-black disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submitting
                                        ? "SAVING..."
                                        : editingReviewId
                                          ? "SAVE CHANGES"
                                          : "SUBMIT REVIEW"}
                                </button>

                                <button
                                    type="button"
                                    onClick={closeReviewForm}
                                    disabled={submitting}
                                    className="border border-zinc-600 px-4 py-2.5 font-mono text-[9px] font-bold uppercase tracking-wide text-zinc-300 hover:border-white disabled:opacity-50"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </form>
                    )}

                    {reviewFormMessage && !formOpen && (
                        <p className="mt-3 text-xs text-zinc-500">
                            {reviewFormMessage}
                        </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-1.5">
                        {(
                            [
                                ["recent", "MOST RECENT"],
                                ["helpful", "MOST HELPFUL"],
                                ["highest", "HIGHEST RATED"],
                                ["lowest", "LOWEST RATED"],
                            ] as [SortOption, string][]
                        ).map(([value, label]) => (
                            <button
                                type="button"
                                key={value}
                                onClick={() => setSort(value)}
                                className={`border px-2.5 py-1.5 font-mono text-[8px] font-bold tracking-wide transition-colors ${
                                    sort === value
                                        ? "border-[#c8ff00] bg-[#c8ff00]/10 text-[#c8ff00]"
                                        : "border-zinc-800 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
                                }`}
                            >
                                {label}
                            </button>
                        ))}

                        {ratingFilter && (
                            <button
                                type="button"
                                onClick={() => setRatingFilter(null)}
                                className="border border-zinc-700 px-2.5 py-1.5 font-mono text-[8px] text-zinc-400 hover:text-white"
                            >
                                CLEAR {ratingFilter}★ FILTER
                            </button>
                        )}
                    </div>

                    <div className="mt-3 space-y-2">
                        {loading ? (
                            <div className="border border-zinc-800 bg-[#101010] p-5 font-mono text-[10px] text-zinc-500">
                                LOADING REVIEWS...
                            </div>
                        ) : data?.reviews.length ? (
                            data.reviews.map((review) => (
                                <article
                                    key={review.id}
                                    className="border border-zinc-800 bg-[#101010] p-4"
                                >
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <Stars
                                            value={review.rating}
                                            size={13}
                                        />

                                        <h3 className="font-mono text-[10px] font-bold uppercase tracking-wide text-white">
                                            {review.headline}
                                        </h3>
                                    </div>

                                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[8px] uppercase text-zinc-500">
                                        <span>{review.displayName}</span>
                                        <span>·</span>
                                        <span>
                                            {formatDate(review.createdAt)}
                                        </span>

                                        {review.verifiedPurchase && (
                                            <span className="inline-flex items-center gap-1 border border-[#526600] px-1.5 py-0.5 text-[#c8ff00]">
                                                <CheckCircle2 size={9} />
                                                VERIFIED
                                            </span>
                                        )}

                                        {review.isOwnReview && (
                                            <span className="text-[#c8ff00]">
                                                YOUR REVIEW
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-zinc-400">
                                        {review.body}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void toggleHelpful(review)
                                            }
                                            disabled={
                                                votingId === review.id ||
                                                review.isOwnReview
                                            }
                                            className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[8px] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                                                review.isHelpful
                                                    ? "border-[#526600] text-[#c8ff00]"
                                                    : "border-zinc-800 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 cursor-pointer"
                                            }`}
                                        >
                                            <ThumbsUp size={10} />
                                            {review.isHelpful
                                                ? "HELPFUL"
                                                : "HELPFUL?"}{" "}
                                            ({review.helpfulCount})
                                        </button>

                                        {review.isOwnReview && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        startEditing(review)
                                                    }
                                                    disabled={
                                                        submitting ||
                                                        deletingId === review.id
                                                    }
                                                    className="inline-flex items-center gap-1.5 border border-zinc-800 px-2.5 py-1.5 font-mono text-[8px] uppercase text-zinc-400 transition-colors hover:border-[#c8ff00] hover:text-[#c8ff00] disabled:opacity-40 cursor-pointer"
                                                >
                                                    <Pencil size={10} />
                                                    EDIT
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void deleteReview(review)
                                                    }
                                                    disabled={
                                                        deletingId === review.id ||
                                                        submitting
                                                    }
                                                    className="inline-flex items-center gap-1.5 border border-zinc-800 px-2.5 py-1.5 font-mono text-[8px] uppercase text-zinc-500 transition-colors hover:border-red-500 hover:text-red-400 disabled:opacity-40 cursor-pointer"
                                                >
                                                    <Trash2 size={10} />
                                                    {deletingId === review.id
                                                        ? "DELETING..."
                                                        : "DELETE"}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="border border-zinc-800 bg-[#101010] p-8 text-center">
                                <p className="font-mono text-xs text-zinc-400">
                                    {ratingFilter
                                        ? `No ${ratingFilter}-star reviews found.`
                                        : "No reviews yet. Be the first to review this product."}
                                </p>

                                {ratingFilter && (
                                    <button
                                        type="button"
                                        onClick={() => setRatingFilter(null)}
                                        className="mt-3 font-mono text-[9px] uppercase text-[#c8ff00] underline"
                                    >
                                        Clear filter
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}
