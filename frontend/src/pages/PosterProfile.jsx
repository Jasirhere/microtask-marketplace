import { useEffect, useMemo, useState } from "react";
import { getUserReviews, getUserStats } from "../api/reviews";
import DashboardHeader from "../components/DashboardHeader";
import { useAuth } from "../auth/AuthContext";
import { createPosterProfile } from "../api/profile";
import {
    Star,
    MapPin,
    Briefcase,
    Edit2,
    Check,
    Award,
    Shield,
    Clock,
    Camera,
    Upload,
    BadgeCheck,
    ThumbsUp,
    MessageSquare,
    DollarSign,
    CheckCircle2,
    Mail,
    Phone,
    Globe,
} from "lucide-react";

export default function PosterProfile() {
    const { user, reload } = useAuth();

    const profile = user?.poster_profile;

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [selectedTab, setSelectedTab] = useState("overview");
    const [reviewFilter, setReviewFilter] = useState("all");
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [editForm, setEditForm] = useState({
        name: profile?.name || "",
        bio: profile?.bio || "",
        location: profile?.location || "",
        phone: profile?.phone || "",
        website: "",
        photo_data_url: profile?.photo_data_url || "",
    });

    const displayName = profile?.name || "Client";
    const bio =
        profile?.bio ||
        "Active job poster seeking talented professionals for various projects. I value clear communication, quality work, and timely delivery.";
    const location = profile?.location || "Location not added";
    const phone = profile?.phone || "Not added";
    const avatar = profile?.photo_data_url || "";
    const memberSince = useMemo(() => {
        const createdAt = profile?.created_at;
        if (!createdAt) return "Member since -";

        const date = new Date(createdAt);
        return `Member since ${date.toLocaleString("en-US", {
            month: "short",
            year: "numeric",
        })}`;
    }, [profile]);
    const badges = [
        { id: "1", name: "Verified Buyer", icon: BadgeCheck, color: "text-blue-500", bg: "bg-blue-50" },
        { id: "2", name: "Payment Verified", icon: Shield, color: "text-emerald-500", bg: "bg-emerald-50" },
        { id: "3", name: "Great Client", icon: Award, color: "text-amber-500", bg: "bg-amber-50" },
        { id: "4", name: "Fast Responder", icon: Clock, color: "text-violet-500", bg: "bg-violet-50" },
    ];


    const averageRating =
        reviews.length > 0
            ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
            : 0;

    const ratingDistribution = {
        5: reviews.filter((r) => r.rating === 5).length,
        4: reviews.filter((r) => r.rating === 4).length,
        3: reviews.filter((r) => r.rating === 3).length,
        2: reviews.filter((r) => r.rating === 2).length,
        1: reviews.filter((r) => r.rating === 1).length,
    };

    const filteredReviews = reviews.filter((review) => {
        if (reviewFilter === "all") return true;
        return review.rating === Number(reviewFilter);
    });
    useEffect(() => {
        async function loadReviews() {
            try {
                if (!user?.id) return;
                const data = await getUserReviews(user.id, "poster");
                setReviews(data);
            } catch (error) {
                console.error("Failed to load reviews", error);
            }
        }

        loadReviews();
    }, [user]);
    useEffect(() => {
        async function loadStats() {
            try {
                if (!user?.id) return;
                const data = await getUserStats(user.id, "poster");
                setStats(data);
            } catch (error) {
                console.error("Failed to load stats", error);
                setStats(null);
            }
        }

        loadStats();
    }, [user]);
    function startEditing() {
        setEditForm({
            name: profile?.name || "",
            bio: profile?.bio || "",
            location: profile?.location || "",
            phone: profile?.phone || "",
            website: "",
            photo_data_url: profile?.photo_data_url || "",
        });
        setSaveError("");
        setIsEditing(true);
    }

    function cancelEditing() {
        setIsEditing(false);
        setSaveError("");
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setEditForm((prev) => ({
                ...prev,
                photo_data_url: reader.result,
            }));
        };
        reader.readAsDataURL(file);
    }

    async function handleSave() {
        setSaving(true);
        setSaveError("");

        try {
            await createPosterProfile({
                name: editForm.name,
                bio: editForm.bio,
                location: editForm.location,
                phone: editForm.phone,
                photo_data_url: editForm.photo_data_url,
            });
            await reload();
            setIsEditing(false);
        } catch (err) {
            setSaveError(err?.response?.data?.detail || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    }

    function handleAvatarUpload() {
        document.getElementById("poster-avatar-upload")?.click();
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <DashboardHeader />

            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Cover Photo */}
                <div className="relative mb-6 h-48 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 md:h-64">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?w=1600')] bg-cover bg-center opacity-20"></div>
                    <button className="absolute right-4 top-4 flex items-center gap-2 rounded-xl bg-black/30 px-4 py-2 text-sm text-white backdrop-blur-md transition-colors hover:bg-black/40">
                        <Camera className="h-4 w-4" />
                        Edit Cover
                    </button>
                </div>

                {/* Profile Header Card */}
                <div className="relative -mt-20 mb-6 rounded-3xl border bg-white p-6 md:-mt-24 md:p-8">
                    <div className="flex flex-col gap-6 md:flex-row">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="group relative">
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt={displayName}
                                        className="h-32 w-32 rounded-3xl object-cover shadow-xl ring-4 ring-white md:h-40 md:w-40"
                                    />
                                ) : (
                                    <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-5xl font-bold text-white shadow-xl ring-4 ring-white md:h-40 md:w-40">
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                <button
                                    onClick={handleAvatarUpload}
                                    className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                                    type="button"
                                >
                                    <div className="text-center text-white">
                                        <Upload className="mx-auto mb-1 h-6 w-6" />
                                        <span className="text-xs">Upload</span>
                                    </div>
                                </button>

                                <input
                                    id="poster-avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                <div className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 shadow-lg ring-4 ring-white">
                                    <Shield className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="min-w-0 flex-1">
                            {isEditing ? (
                                <div className="space-y-4">
                                    {saveError && (
                                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                            {saveError}
                                        </div>
                                    )}

                                    <input
                                        type="text"
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleChange}
                                        placeholder="Full Name"
                                        className="w-full rounded-xl border bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />

                                    <textarea
                                        name="bio"
                                        value={editForm.bio}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Tell us about yourself..."
                                        className="w-full rounded-xl border bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <input
                                            type="text"
                                            name="location"
                                            value={editForm.location}
                                            onChange={handleChange}
                                            placeholder="Location"
                                            className="rounded-xl border bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                        <input
                                            type="text"
                                            name="phone"
                                            value={editForm.phone}
                                            onChange={handleChange}
                                            placeholder="Phone"
                                            className="rounded-xl border bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                        <input
                                            type="text"
                                            name="website"
                                            value={editForm.website}
                                            onChange={handleChange}
                                            placeholder="Website"
                                            className="rounded-xl border bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 md:col-span-2"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
                                            type="button"
                                        >
                                            <Check className="h-5 w-5" />
                                            {saving ? "Saving..." : "Save Changes"}
                                        </button>

                                        <button
                                            onClick={cancelEditing}
                                            className="rounded-xl border px-6 py-3 font-medium transition-colors hover:bg-slate-50"
                                            type="button"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex items-center gap-3">
                                                <h1 className="truncate text-3xl font-bold md:text-4xl">{displayName}</h1>
                                                <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-600">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Verified
                                                </span>
                                            </div>

                                            <p className="mb-2 text-lg capitalize text-slate-500">Client</p>
                                        </div>

                                        <button
                                            onClick={startEditing}
                                            className="flex items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 transition-colors hover:bg-slate-50"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                            <span className="hidden md:inline">Edit Profile</span>
                                        </button>
                                    </div>

                                    {bio && <p className="mb-4 leading-relaxed text-slate-500">{bio}</p>}

                                    <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5">
                                            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                            <span className="font-semibold text-slate-900">{stats?.rating ?? 0}</span>
                                            ({stats?.total_reviews ?? 0} reviews)
                                        </span>

                                        <span className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5">
                                            <Briefcase className="h-4 w-4" />
                                            <span className="font-semibold text-slate-900">{stats?.jobs ?? 0}</span> completed
                                        </span>

                                        <span className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5">
                                            <MapPin className="h-4 w-4" />
                                            {location}
                                        </span>

                                        <span className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5">
                                            <Clock className="h-4 w-4" />
                                            {memberSince}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600">
                                            <MessageSquare className="h-4 w-4" />
                                            Contact
                                        </button>

                                        <button className="rounded-xl border px-4 py-2.5 transition-colors hover:bg-slate-50">
                                            <Mail className="h-4 w-4" />
                                        </button>

                                        <button className="rounded-xl border px-4 py-2.5 transition-colors hover:bg-slate-50">
                                            <Phone className="h-4 w-4" />
                                        </button>

                                        <button className="rounded-xl border px-4 py-2.5 transition-colors hover:bg-slate-50">
                                            <Globe className="h-4 w-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Badges */}
                <div className="mb-6 rounded-3xl border bg-white p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                        <Award className="h-5 w-5 text-amber-500" />
                        Achievements & Badges
                    </h2>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {badges.map((badge) => (
                            <div
                                key={badge.id}
                                className={`${badge.bg} rounded-2xl p-4 text-center transition-transform hover:scale-105`}
                            >
                                <badge.icon className={`mx-auto mb-2 h-8 w-8 ${badge.color}`} />
                                <p className="text-sm font-medium">{badge.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="overflow-hidden rounded-3xl border bg-white">
                    <div className="border-b">
                        <div className="flex overflow-x-auto">
                            {["overview", "reviews", "stats"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`whitespace-nowrap px-6 py-4 font-medium transition-colors ${selectedTab === tab
                                        ? "border-b-2 border-emerald-500 text-emerald-600"
                                        : "text-slate-500 hover:text-slate-900"
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6">
                        {selectedTab === "overview" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-50/40 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-emerald-500" />
                                            <p className="text-sm text-slate-500">Spent</p>
                                        </div>
                                        <p className="text-2xl font-bold">$10,350</p>
                                    </div>

                                    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-violet-50/40 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Briefcase className="h-5 w-5 text-violet-500" />
                                            <p className="text-sm text-slate-500">Jobs</p>
                                        </div>
                                        <p className="text-2xl font-bold">{stats?.jobs ?? 0}</p>
                                    </div>

                                    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-50/40 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <ThumbsUp className="h-5 w-5 text-amber-500" />
                                            <p className="text-sm text-slate-500">Hired</p>
                                        </div>
                                        <p className="text-2xl font-bold">5</p>
                                    </div>

                                    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-50/40 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-blue-500" />
                                            <p className="text-sm text-slate-500">Response</p>
                                        </div>
                                        <p className="text-2xl font-bold">~2h</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-4 text-lg font-semibold">Hiring Preferences</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {["Home Services", "Technology", "Creative Services", "Digital Services"].map(
                                            (category) => (
                                                <span
                                                    key={category}
                                                    className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600"
                                                >
                                                    {category}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-lg font-semibold">About</h3>
                                    <p className="leading-relaxed text-slate-500">{bio}</p>
                                </div>

                                <div>
                                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                                        <Briefcase className="h-5 w-5 text-emerald-500" />
                                        Hiring Activity
                                    </h3>

                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-sm text-slate-500">Active Jobs</span>
                                            <span className="text-sm font-medium text-emerald-600">2</span>
                                        </div>

                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-sm text-slate-500">Avg. Response Time</span>
                                            <span className="text-sm font-medium">Within 2 hours</span>
                                        </div>

                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-sm text-slate-500">Payment Method</span>
                                            <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Verified
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500">Phone</span>
                                            <span className="text-sm font-medium">{phone}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedTab === "reviews" && (
                            <div className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-50/40 p-6">
                                        <div className="text-center">
                                            <p className="mb-2 text-6xl font-bold">
                                                {stats?.rating ?? 0}
                                            </p>
                                            <div className="mb-2 flex items-center justify-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
                                                ))}
                                            </div>
                                            <p className="text-slate-500">
                                                Based on {stats?.total_reviews ?? 0} review{(stats?.total_reviews ?? 0) === 1 ? "" : "s"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {[5, 4, 3, 2, 1].map((rating) => (
                                            <div key={rating} className="flex items-center gap-3">
                                                <span className="w-12 text-sm font-medium">{rating} star</span>
                                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full bg-amber-500"
                                                        style={{
                                                            width:
                                                                reviews.length > 0
                                                                    ? `${(ratingDistribution[rating] / reviews.length) * 100}%`
                                                                    : "0%",
                                                        }}
                                                    />
                                                </div>
                                                <span className="w-8 text-sm text-slate-500">
                                                    {ratingDistribution[rating]}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {[
                                        { key: "all", label: "All Reviews" },
                                        { key: "5", label: "5 Stars" },
                                        { key: "4", label: "4 Stars" },
                                    ].map((item) => (
                                        <button
                                            key={item.key}
                                            onClick={() => setReviewFilter(item.key)}
                                            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${reviewFilter === item.key
                                                ? "bg-emerald-500 text-white"
                                                : "border hover:bg-slate-50"
                                                }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    {filteredReviews.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
                                            No reviews yet.
                                        </div>
                                    ) : (
                                        filteredReviews.map((review) => (
                                            <div key={review.id} className="rounded-2xl border bg-white p-5">
                                                <div className="flex items-start gap-4">
                                                    {review.reviewer_photo_data_url ? (
                                                        <img
                                                            src={review.reviewer_photo_data_url}
                                                            alt={review.reviewer_name || "Reviewer"}
                                                            className="h-14 w-14 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                                                            {(review.reviewer_name || review.reviewer_role || "R").charAt(0).toUpperCase()}
                                                        </div>
                                                    )}

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-col justify-between gap-2 md:flex-row">
                                                            <div>
                                                                <h4 className="font-semibold text-slate-900">
                                                                    {review.reviewer_name || `Review from ${review.reviewer_role}`}
                                                                </h4>
                                                                <p className="text-sm text-slate-500">
                                                                    {review.reviewer_role === "poster" ? "Client" : "Worker"} • Job
                                                                </p>
                                                            </div>

                                                            <div className="text-sm text-slate-400">
                                                                {review.created_at
                                                                    ? new Date(review.created_at).toLocaleDateString()
                                                                    : ""}
                                                            </div>
                                                        </div>

                                                        <div className="mt-2 flex items-center gap-2">
                                                            {[...Array(review.rating)].map((_, i) => (
                                                                <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                                                            ))}
                                                        </div>

                                                        <p className="mt-3 leading-6 text-slate-600">{review.comment}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {selectedTab === "stats" && (
                            <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="rounded-2xl border p-5">
                                        <div className="text-sm text-slate-500">Total Spent</div>
                                        <div className="mt-2 text-2xl font-bold text-emerald-600">$10,350</div>
                                    </div>

                                    <div className="rounded-2xl border p-5">
                                        <div className="text-sm text-slate-500">Jobs Posted</div>
                                        <div className="mt-2 text-2xl font-bold text-violet-600">{stats?.jobs ?? 0}</div>                                    </div>

                                    <div className="rounded-2xl border p-5">
                                        <div className="text-sm text-slate-500">Workers Hired</div>
                                        <div className="mt-2 text-2xl font-bold text-amber-600">5</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { label: "Home Services", amount: "$3,750", width: "70%" },
                                        { label: "Technology", amount: "$4,800", width: "60%" },
                                        { label: "Creative Services", amount: "$1,200", width: "35%" },
                                        { label: "Digital Services", amount: "$600", width: "20%" },
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <div className="mb-2 flex items-center justify-between text-sm">
                                                <span>{item.label}</span>
                                                <span className="font-medium text-emerald-600">{item.amount}</span>
                                            </div>
                                            <div className="h-3 rounded-full bg-slate-100">
                                                <div
                                                    className="h-3 rounded-full bg-emerald-500"
                                                    style={{ width: item.width }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <h3 className="mb-3 text-lg font-semibold">Recent Activity</h3>
                                    <div className="space-y-3">
                                        {[
                                            "Posted new job: Website Development",
                                            "Left 5-star review for John Smith",
                                            "Job completed: Home Renovation",
                                            "Payment sent: $1,500",
                                        ].map((item) => (
                                            <div key={item} className="rounded-2xl border bg-white p-4 text-sm text-slate-600">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}