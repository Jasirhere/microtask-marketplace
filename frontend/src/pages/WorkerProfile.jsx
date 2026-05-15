import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Award,
  BadgeCheck,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Edit2,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
  Star,
  Target,
  ThumbsUp,
  Upload,
  Zap,
} from "lucide-react";

import { getUserReviews, getUserStats } from "../api/reviews";
import DashboardHeader from "../components/DashboardHeader";
import { useAuth } from "../auth/AuthContext";
import { getMyWorkerJobs } from "../api/applications";
import { createWorkerProfile, getWorkerProfile } from "../api/profile";

export default function WorkerProfile() {
  const { user, reload } = useAuth();
  const { userId } = useParams();

  const isViewingOtherUser = !!userId && userId !== user?.id;

  const [viewedUser, setViewedUser] = useState(null);
  const [loadingViewedUser, setLoadingViewedUser] = useState(false);

  const currentProfile = isViewingOtherUser
    ? viewedUser?.worker_profile
    : user?.worker_profile;

  const currentUserId = isViewingOtherUser ? viewedUser?.id : user?.id;
  const profile = currentProfile;

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [workerJobs, setWorkerJobs] = useState([]);

  const [editForm, setEditForm] = useState({
    name: profile?.name || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    phone: profile?.phone || "",
    website: "",
    hourlyRate: "",
    photo_data_url: profile?.photo_data_url || "",
    skills: profile?.skills || [],
  });

  useEffect(() => {
    async function loadViewedUser() {
      if (!isViewingOtherUser) return;

      try {
        setLoadingViewedUser(true);
        const data = await getWorkerProfile(userId);
        setViewedUser(data);
      } catch (error) {
        console.error("Failed to load worker profile", error);
      } finally {
        setLoadingViewedUser(false);
      }
    }

    loadViewedUser();
  }, [userId, isViewingOtherUser]);

  useEffect(() => {
    async function loadStats() {
      try {
        const idToLoad = isViewingOtherUser ? userId : user?.id;
        if (!idToLoad) return;

        const data = await getUserStats(idToLoad, "worker");
        setStats(data);
      } catch (error) {
        console.error("Failed to load stats", error);
        setStats(null);
      }
    }

    loadStats();
  }, [user, isViewingOtherUser, userId]);

  useEffect(() => {
    async function loadReviews() {
      try {
        const idToLoad = isViewingOtherUser ? userId : user?.id;
        if (!idToLoad) return;

        const data = await getUserReviews(idToLoad, "worker");
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load reviews", error);
        setReviews([]);
      }
    }

    loadReviews();
  }, [user, isViewingOtherUser, userId]);

  useEffect(() => {
    async function loadWorkerJobs() {
      try {
        if (isViewingOtherUser) return;

        const data = await getMyWorkerJobs();
        setWorkerJobs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load worker jobs", error);
        setWorkerJobs([]);
      }
    }

    loadWorkerJobs();
  }, [isViewingOtherUser]);

  const displayName = profile?.name || "Worker";

  const bio =
    profile?.bio ||
    "Reliable worker focused on quality, communication, and timely delivery. I take pride in doing every job properly and making the client experience smooth.";

  const location = profile?.location || "Location not added";
  const phone = profile?.phone || "Not added";
  const avatar = profile?.photo_data_url || "";
  const skills = Array.isArray(profile?.skills) ? profile.skills : [];

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
    {
      id: "1",
      name: "Top Rated",
      icon: Award,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      id: "2",
      name: "Quick Responder",
      icon: Zap,
      color: "text-violet-500",
      bg: "bg-violet-50",
    },
    {
      id: "3",
      name: "100% Job Success",
      icon: Target,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      id: "4",
      name: "Verified Pro",
      icon: BadgeCheck,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
  ];

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) /
        reviews.length
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

  function startEditing() {
    setEditForm({
      name: profile?.name || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      phone: profile?.phone || "",
      website: "",
      hourlyRate: "",
      photo_data_url: profile?.photo_data_url || "",
      skills: profile?.skills || [],
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

  function handleSkillsChange(e) {
    const parsedSkills = e.target.value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setEditForm((prev) => ({
      ...prev,
      skills: parsedSkills,
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
      await createWorkerProfile({
        name: editForm.name,
        bio: editForm.bio,
        location: editForm.location,
        phone: editForm.phone,
        photo_data_url: editForm.photo_data_url,
        skills: editForm.skills,
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
    document.getElementById("worker-avatar-upload")?.click();
  }

  function getJobStatus(item) {
    return item.job_status || item.status || item.job?.status || "";
  }

  function getJobTitle(item) {
    return item.job_title || item.title || item.job?.title || "Untitled job";
  }

  function getJobSkills(item) {
    if (Array.isArray(item.skills_required)) return item.skills_required;
    if (Array.isArray(item.job?.skills_required)) return item.job.skills_required;
    return [];
  }

  function getJobDate(item) {
    return item.created_at || item.applied_at || item.job?.created_at || null;
  }

  const completedWorkerJobs = workerJobs.filter((item) => {
    return getJobStatus(item) === "COMPLETED";
  });

  const activeWorkerJobs = workerJobs.filter((item) => {
    const status = getJobStatus(item);
    return ["ASSIGNED", "IN_PROGRESS", "SELECTED"].includes(status);
  });

  const skillCounts = completedWorkerJobs.reduce((acc, item) => {
    const jobSkills = getJobSkills(item);

    jobSkills.forEach((skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
    });

    return acc;
  }, {});

  const totalSkillCount = Object.values(skillCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const skillDistribution = Object.entries(skillCounts)
    .map(([skill, count]) => ({
      label: skill,
      count,
      percentage:
        totalSkillCount > 0 ? Math.round((count / totalSkillCount) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentActivity = workerJobs
    .map((item) => {
      const title = getJobTitle(item);
      const status = getJobStatus(item);
      const createdAt = getJobDate(item);

      if (status === "COMPLETED") {
        return {
          text: `Completed job: ${title}`,
          createdAt,
        };
      }

      if (["ASSIGNED", "IN_PROGRESS", "SELECTED"].includes(status)) {
        return {
          text: `Started assignment: ${title}`,
          createdAt,
        };
      }

      if (status === "APPLIED") {
        return {
          text: `Applied for job: ${title}`,
          createdAt,
        };
      }

      return null;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  if (isViewingOtherUser && loadingViewedUser) {
    return (
      <div className="min-h-screen bg-slate-50 pb-10">
        <DashboardHeader />

        <main className="mx-auto flex min-h-[400px] max-w-7xl items-center justify-center px-4 py-8">
          <div className="text-sm text-slate-500">
            Loading worker profile...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <section className="relative mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:mb-6 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="relative shrink-0">
              <div className="group relative w-fit">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={displayName}
                    className="h-28 w-28 rounded-3xl object-cover shadow-lg ring-4 ring-white sm:h-36 sm:w-36 lg:h-40 lg:w-40"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-4xl font-bold text-white shadow-lg ring-4 ring-white sm:h-36 sm:w-36 sm:text-5xl lg:h-40 lg:w-40">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                {!isViewingOtherUser && (
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
                )}

                <input
                  id="worker-avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div className="absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 shadow-lg ring-4 ring-white sm:h-12 sm:w-12">
                  <Shield className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  {saveError && (
                    <div className="break-words rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {saveError}
                    </div>
                  )}

                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  <textarea
                    name="bio"
                    value={editForm.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      type="text"
                      name="location"
                      value={editForm.location}
                      onChange={handleChange}
                      placeholder="Location"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <input
                      type="text"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleChange}
                      placeholder="Phone"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <input
                      type="text"
                      name="hourlyRate"
                      value={editForm.hourlyRate}
                      onChange={handleChange}
                      placeholder="Hourly Rate (optional)"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <input
                      type="text"
                      name="website"
                      value={editForm.website}
                      onChange={handleChange}
                      placeholder="Website"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <input
                    type="text"
                    name="skills"
                    value={editForm.skills.join(", ")}
                    onChange={handleSkillsChange}
                    placeholder="Skills (comma separated)"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <button
                      onClick={cancelEditing}
                      className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold transition-colors hover:bg-slate-50 sm:w-auto"
                      type="button"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-60 sm:w-auto"
                      type="button"
                    >
                      <Check className="h-5 w-5" />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <h1 className="break-words text-2xl font-bold text-slate-950 sm:text-3xl lg:text-4xl">
                          {displayName}
                        </h1>

                        <span className="flex w-fit items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </span>
                      </div>

                      <p className="text-base text-slate-500 sm:text-lg">
                        Professional Service Provider
                      </p>
                    </div>

                    {!isViewingOtherUser && (
                      <button
                        onClick={startEditing}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50 sm:w-auto"
                        type="button"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {bio && (
                    <p className="mb-4 max-w-4xl break-words text-sm leading-7 text-slate-600 sm:text-base">
                      {bio}
                    </p>
                  )}

                  <div className="mb-4 flex flex-wrap gap-2 text-sm text-slate-500">
                    <ProfilePill
                      icon={
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      }
                    >
                      <span className="font-semibold text-slate-900">
                        {stats?.rating ?? averageRating.toFixed(1)}
                      </span>
                      <span>({stats?.total_reviews ?? reviews.length} reviews)</span>
                    </ProfilePill>

                    <ProfilePill icon={<Briefcase className="h-4 w-4" />}>
                      <span className="font-semibold text-slate-900">
                        {stats?.jobs ?? 0}
                      </span>
                      <span>completed</span>
                    </ProfilePill>

                    <ProfilePill icon={<MapPin className="h-4 w-4" />}>
                      <span className="break-words">{location}</span>
                    </ProfilePill>

                    <ProfilePill icon={<Clock className="h-4 w-4" />}>
                      <span className="break-words">{memberSince}</span>
                    </ProfilePill>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    <button
                      className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 sm:col-span-1"
                      type="button"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Contact
                    </button>

                    <IconButton icon={<Mail className="h-4 w-4" />} />
                    <IconButton icon={<Phone className="h-4 w-4" />} />
                    <IconButton icon={<Globe className="h-4 w-4" />} />
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200">
            <div className="flex overflow-x-auto">
              {["overview", "reviews", "stats"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`whitespace-nowrap px-5 py-4 text-sm font-semibold transition-colors sm:px-6 ${
                    selectedTab === tab
                      ? "border-b-2 border-emerald-500 text-emerald-600"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  type="button"
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {selectedTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    icon={<Star className="h-5 w-5 text-emerald-500" />}
                    label="Rating"
                    value={stats?.rating ?? averageRating.toFixed(1)}
                    border="border-emerald-200"
                    bg="from-emerald-50 to-emerald-50/40"
                  />

                  <MetricCard
                    icon={<Briefcase className="h-5 w-5 text-violet-500" />}
                    label="Jobs"
                    value={stats?.jobs ?? 0}
                    border="border-violet-200"
                    bg="from-violet-50 to-violet-50/40"
                  />

                  <MetricCard
                    icon={<ThumbsUp className="h-5 w-5 text-amber-500" />}
                    label="Success"
                    value={`${stats?.success_rate ?? 0}%`}
                    border="border-amber-200"
                    bg="from-amber-50 to-amber-50/40"
                  />

                  <MetricCard
                    icon={<Clock className="h-5 w-5 text-blue-500" />}
                    label="Response"
                    value="~1h"
                    border="border-blue-200"
                    bg="from-blue-50 to-blue-50/40"
                  />
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold text-slate-900">
                    Skills & Expertise
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.map((skill) => (
                        <span
                          key={skill}
                          className="max-w-full rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600"
                        >
                          <span className="break-words">{skill}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">
                        No skills added yet.
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold text-slate-900">
                    About
                  </h3>

                  <p className="break-words text-sm leading-7 text-slate-600 sm:text-base">
                    {bio}
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <Calendar className="h-5 w-5 shrink-0 text-emerald-500" />
                    Availability
                  </h3>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <ActivityRow label="Status" value="Available Now" highlight />
                    <ActivityRow label="Typical Response Time" value="Within 1 hour" />
                    <ActivityRow label="Phone" value={phone} />
                    <ActivityRow label="Location" value={location} last />
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold text-slate-900">
                    Badges
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {badges.map((badge) => {
                      const Icon = badge.icon;

                      return (
                        <div
                          key={badge.id}
                          className={`flex min-w-0 items-center gap-3 rounded-2xl ${badge.bg} p-4`}
                        >
                          <Icon className={`h-5 w-5 shrink-0 ${badge.color}`} />

                          <span className="break-words text-sm font-semibold text-slate-800">
                            {badge.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === "reviews" && (
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-50/40 p-6">
                    <div className="text-center">
                      <p className="mb-2 text-5xl font-bold sm:text-6xl">
                        {stats?.rating ?? averageRating.toFixed(1)}
                      </p>

                      <div className="mb-2 flex items-center justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-5 w-5 fill-amber-500 text-amber-500"
                          />
                        ))}
                      </div>

                      <p className="text-sm text-slate-500 sm:text-base">
                        Based on {stats?.total_reviews ?? reviews.length} review
                        {(stats?.total_reviews ?? reviews.length) === 1
                          ? ""
                          : "s"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div
                        key={rating}
                        className="grid grid-cols-[54px_minmax(0,1fr)_32px] items-center gap-3"
                      >
                        <span className="text-sm font-medium text-slate-700">
                          {rating} star
                        </span>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-amber-500"
                            style={{
                              width:
                                reviews.length > 0
                                  ? `${
                                      (ratingDistribution[rating] /
                                        reviews.length) *
                                      100
                                    }%`
                                  : "0%",
                            }}
                          />
                        </div>

                        <span className="text-right text-sm text-slate-500">
                          {ratingDistribution[rating]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "all", label: "All Reviews" },
                    { key: "5", label: "5 Stars" },
                    { key: "4", label: "4 Stars" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setReviewFilter(item.key)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                        reviewFilter === item.key
                          ? "bg-emerald-500 text-white"
                          : "border border-slate-300 hover:bg-slate-50"
                      }`}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {filteredReviews.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500 sm:p-10">
                      No reviews yet.
                    </div>
                  ) : (
                    filteredReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))
                  )}
                </div>
              </div>
            )}

            {selectedTab === "stats" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <SimpleStat
                    label="Completed Jobs"
                    value={stats?.jobs ?? 0}
                    className="text-emerald-600"
                  />

                  <SimpleStat
                    label="Active Jobs"
                    value={activeWorkerJobs.length}
                    className="text-blue-600"
                  />

                  <SimpleStat
                    label="Success Rate"
                    value={`${stats?.success_rate ?? 0}%`}
                    className="text-amber-600"
                  />

                  <SimpleStat
                    label="Avg. Rating"
                    value={stats?.rating ?? averageRating.toFixed(1)}
                    className="text-violet-600"
                  />
                </div>

                <div className="space-y-4">
                  {skillDistribution.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                      No completed job history yet.
                    </div>
                  ) : (
                    skillDistribution.map((item) => (
                      <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                          <span className="break-words">{item.label}</span>

                          <span className="shrink-0 font-medium text-emerald-600">
                            {item.percentage}%
                          </span>
                        </div>

                        <div className="h-3 rounded-full bg-slate-100">
                          <div
                            className="h-3 rounded-full bg-emerald-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold text-slate-900">
                    Recent Activity
                  </h3>

                  <div className="space-y-3">
                    {recentActivity.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                        No recent activity yet.
                      </div>
                    ) : (
                      recentActivity.map((item, index) => (
                        <div
                          key={`${item.text}-${index}`}
                          className="break-words rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600"
                        >
                          {item.text}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function ProfilePill({ icon, children }) {
  return (
    <span className="flex max-w-full items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5">
      <span className="shrink-0">{icon}</span>
      <span className="flex min-w-0 flex-wrap items-center gap-1">
        {children}
      </span>
    </span>
  );
}

function IconButton({ icon }) {
  return (
    <button
      className="flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 transition-colors hover:bg-slate-50"
      type="button"
    >
      {icon}
    </button>
  );
}

function MetricCard({ icon, label, value, border, bg }) {
  return (
    <div className={`rounded-2xl border ${border} bg-gradient-to-br ${bg} p-4`}>
      <div className="mb-2 flex min-w-0 items-center gap-2">
        <span className="shrink-0">{icon}</span>

        <p className="break-words text-sm text-slate-500">{label}</p>
      </div>

      <p className="break-words text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function ActivityRow({ label, value, highlight = false, last = false }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        last ? "" : "mb-2"
      }`}
    >
      <span className="break-words text-sm text-slate-500">{label}</span>

      <span
        className={`shrink-0 text-right text-sm font-semibold ${
          highlight ? "text-emerald-600" : "text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {review.reviewer_photo_data_url ? (
          <img
            src={review.reviewer_photo_data_url}
            alt={review.reviewer_name || "Reviewer"}
            className="h-14 w-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
            {(review.reviewer_name || review.reviewer_role || "R")
              .charAt(0)
              .toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-col justify-between gap-2 md:flex-row">
            <div className="min-w-0">
              <h4 className="break-words font-semibold text-slate-900">
                {review.reviewer_name || `Review from ${review.reviewer_role}`}
              </h4>

              <p className="break-words text-sm text-slate-500">
                {review.reviewer_role === "poster" ? "Client" : "Worker"} • Job
              </p>
            </div>

            <div className="shrink-0 text-sm text-slate-400">
              {review.created_at
                ? new Date(review.created_at).toLocaleDateString()
                : ""}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1">
            {[...Array(review.rating)].map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-amber-500 text-amber-500"
              />
            ))}
          </div>

          <p className="mt-3 break-words text-sm leading-6 text-slate-600">
            {review.comment}
          </p>
        </div>
      </div>
    </article>
  );
}

function SimpleStat({ label, value, className }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="text-sm text-slate-500">{label}</div>

      <div className={`mt-2 break-words text-2xl font-bold ${className}`}>
        {value}
      </div>
    </div>
  );
}