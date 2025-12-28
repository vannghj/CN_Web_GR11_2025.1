import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Menu, X, Star } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import movieService from '../services/movieService';

export default function HomePage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPopularInterest, setShowPopularInterest] = useState(false);
  const [showBestRated, setShowBestRated] = useState(false);
  
  // Movie data states
  const [movies, setMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch movies on mount
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const [allMoviesRes, topRatedRes] = await Promise.all([
          movieService.getAllMovies({ limit: 20 }),
          movieService.getTopRatedMovies(20)
        ]);

        console.log('All Movies Response:', allMoviesRes);
        console.log('Top Rated Response:', topRatedRes);

        if (allMoviesRes.success) {
          const moviesData = allMoviesRes.data?.movies || [];
          console.log('Movies Data:', moviesData);
          moviesData.forEach((movie, index) => {
            console.log(`Movie ${index + 1}:`, {
              title: movie.title,
              posterUrl: movie.posterUrl,
              backgroundUrl: movie.backgroundUrl,
              trailerUrl: movie.trailerUrl
            });
          });
          setMovies(moviesData);
        }
        if (topRatedRes.success) {
          setTopRatedMovies(topRatedRes.data?.movies || []);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Most rated movies (by number of ratings)
  const mostRatedMovies = React.useMemo(() => {
    return [...movies].sort((a, b) => {
      const diff = (b.ratingCount || 0) - (a.ratingCount || 0);
      if (diff !== 0) return diff;
      return (b.averageRating || 0) - (a.averageRating || 0);
    });
  }, [movies]);

  const nextSlide = () => {
    const totalSlides = movies.length > 0 ? movies.length : 7;
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    const totalSlides = movies.length > 0 ? movies.length : 7;
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Carousel */}
      <section className="relative py-12 overflow-hidden">
        {/* Background Image */}
        {!loading && movies.length > 0 && movies[currentSlide % movies.length]?.backgroundUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${movies[currentSlide % movies.length].backgroundUrl})`,
            }}
            onError={(e) => {
              console.error('Background image failed to load:', movies[currentSlide % movies.length].backgroundUrl);
              e.target.style.display = 'none';
            }}
          >
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
          </div>
        )}
        
        {/* Fallback background if no image */}
        {(!movies[currentSlide % movies.length]?.backgroundUrl || loading || movies.length === 0) && (
          <div className="absolute inset-0 bg-gray-200"></div>
        )}

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-gray-600 text-xl">Loading movies...</div>
            </div>
          ) : movies.length === 0 ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-center">
                <p className="text-gray-600 text-xl mb-4">No movies available</p>
                <p className="text-gray-500">Please add movies from Admin Panel</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                {/* Left Arrow */}
                <button 
                  onClick={prevSlide}
                  className="p-3 hover:bg-white/20 rounded-full transition flex-shrink-0 z-10 bg-black/30"
                >
                  <ChevronLeft size={40} className="text-white" strokeWidth={2.5} />
                </button>

                {/* Content Area */}
                <div className="flex items-center justify-between flex-1 px-12">
                  {/* Movie Info */}
                  <div className="space-y-3 text-white">
                    <h1 className="text-4xl font-bold mb-4">{movies[currentSlide % movies.length]?.title}</h1>
                    <div className="text-lg font-medium">
                      {movies[currentSlide % movies.length]?.releaseYear || 'N/A'} • {Math.floor((movies[currentSlide % movies.length]?.duration || 0) / 60)}h{(movies[currentSlide % movies.length]?.duration || 0) % 60}m
                    </div>
                    <div className="text-base">
                      <span className="font-semibold">{movies[currentSlide % movies.length]?.country || 'Unknown'}</span>
                      <span className="mx-2">|</span>
                      <span>{movies[currentSlide % movies.length]?.genres?.map(g => g.name).join(', ') || 'No genres'}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Star size={20} className="text-yellow-400" fill="#facc15" />
                      <span className="text-xl font-semibold">{movies[currentSlide % movies.length]?.averageRating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/movie/${movies[currentSlide % movies.length]?._id}`)}
                      className="bg-red-600 text-white px-7 py-3 flex items-center gap-2 hover:bg-red-700 transition rounded-md mt-4"
                    >
                      <Play size={20} fill="white" />
                      <span className="font-medium">Watch Trailer</span>
                    </button>
                  </div>

                  {/* Movie Poster */}
                  <div 
                    onClick={() => navigate(`/movie/${movies[currentSlide % movies.length]?._id}`)}
                    className="w-72 h-96 bg-white flex items-center justify-center shadow-2xl cursor-pointer hover:opacity-80 transition overflow-hidden rounded-lg"
                  >
                    {movies[currentSlide % movies.length]?.posterUrl ? (
                      <img 
                        src={movies[currentSlide % movies.length].posterUrl} 
                        alt={movies[currentSlide % movies.length].title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-300">
                        <svg width="180" height="180" viewBox="0 0 180 180">
                          <line x1="30" y1="30" x2="150" y2="150" stroke="currentColor" strokeWidth="18" />
                          <line x1="150" y1="30" x2="30" y2="150" stroke="currentColor" strokeWidth="18" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Arrow */}
                <button 
                  onClick={nextSlide}
                  className="p-3 hover:bg-white/20 rounded-full transition flex-shrink-0 z-10 bg-black/30"
                >
                  <ChevronRight size={40} className="text-white" strokeWidth={2.5} />
                </button>
              </div>

              {/* Dots Indicator */}
              <div className="flex items-center justify-center gap-2 mt-8">
                {movies.slice(0, Math.min(movies.length, 7)).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === currentSlide ? 'bg-white w-10' : 'bg-white/50 w-2.5'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Content Sections */}
      <section className="max-w-7xl mx-auto py-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Popular Interest */}
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Nhiều rating nhất</h2>
            <div className="bg-gray-200 p-8 rounded-lg">
              <div className="flex justify-between gap-5 mb-5">
                {loading ? (
                  [1, 2, 3].map((item) => (
                    <div 
                      key={item} 
                      className="flex-1 aspect-[2/3] bg-white flex items-center justify-center shadow-sm rounded-lg"
                    >
                      <div className="animate-pulse bg-gray-200 w-full h-full rounded-lg"></div>
                    </div>
                  ))
                ) : mostRatedMovies.length === 0 ? (
                  <div className="flex-1 text-center text-gray-500 py-8">
                    No movies available
                  </div>
                ) : (
                  mostRatedMovies.slice(0, 3).map((movie) => (
                    <div 
                      key={movie._id} 
                      onClick={() => navigate(`/movie/${movie._id}`)}
                      className="flex-1 cursor-pointer group"
                    >
                      {/* Movie Poster Card */}
                      <div className="aspect-[2/3] bg-white shadow-lg rounded-lg overflow-hidden relative group-hover:shadow-2xl transition-all duration-300">
                        {movie.posterUrl ? (
                          <>
                            <img 
                              src={movie.posterUrl} 
                              alt={movie.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Rating Badge */}
                            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                              <Star size={16} className="text-yellow-400" fill="#facc15" />
                              <span className="text-white font-bold text-sm">
                                {movie.averageRating?.toFixed(1) || '0.0'}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <div className="text-gray-300">
                              <svg width="80" height="80" viewBox="0 0 100 100">
                                <line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" strokeWidth="8" />
                                <line x1="80" y1="20" x2="20" y2="80" stroke="currentColor" strokeWidth="8" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Movie Info */}
                      <div className="mt-3">
                        <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-blue-600 transition">
                          {movie.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <span>{movie.releaseYear || 'N/A'}</span>
                          {movie.ratingCount > 0 && (
                            <>
                              <span>•</span>
                              <span>{movie.ratingCount} lượt đánh giá</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button 
                onClick={() => setShowPopularInterest(true)}
                className="flex items-center gap-2 text-gray-800 hover:text-gray-600 transition"
              >
                <Menu size={18} strokeWidth={2} />
                <span className="font-semibold text-sm">Xem tất cả</span>
              </button>
            </div>
            <h3 className="text-xl font-semibold mt-4 text-gray-900">What to watch this month</h3>
          </div>

          {/* Best Rated */}
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Best Rated Films</h2>
            <div className="bg-gray-200 p-8 rounded-lg">
              <div className="flex justify-between gap-5 mb-5">
                {loading ? (
                  [1, 2, 3].map((item) => (
                    <div 
                      key={item} 
                      className="flex-1 aspect-[2/3] bg-white flex items-center justify-center shadow-sm rounded-lg"
                    >
                      <div className="animate-pulse bg-gray-200 w-full h-full rounded-lg"></div>
                    </div>
                  ))
                ) : topRatedMovies.length === 0 ? (
                  <div className="flex-1 text-center text-gray-500 py-8">
                    No rated movies available yet
                  </div>
                ) : (
                  topRatedMovies.slice(0, 3).map((movie) => (
                    <div 
                      key={movie._id} 
                      onClick={() => navigate(`/movie/${movie._id}`)}
                      className="flex-1 cursor-pointer group"
                    >
                      {/* Movie Poster Card */}
                      <div className="aspect-[2/3] bg-white shadow-lg rounded-lg overflow-hidden relative group-hover:shadow-2xl transition-all duration-300">
                        {movie.posterUrl ? (
                          <>
                            <img 
                              src={movie.posterUrl} 
                              alt={movie.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Rating Badge */}
                            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                              <Star size={16} className="text-yellow-400" fill="#facc15" />
                              <span className="text-white font-bold text-sm">
                                {movie.averageRating?.toFixed(1) || '0.0'}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <div className="text-gray-300">
                              <svg width="80" height="80" viewBox="0 0 100 100">
                                <line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" strokeWidth="8" />
                                <line x1="80" y1="20" x2="20" y2="80" stroke="currentColor" strokeWidth="8" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Movie Info */}
                      <div className="mt-3">
                        <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-blue-600 transition">
                          {movie.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <span>{movie.releaseYear || 'N/A'}</span>
                          {movie.ratingCount > 0 && (
                            <>
                              <span>•</span>
                              <span>{movie.ratingCount} ratings</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button 
                onClick={() => setShowBestRated(true)}
                className="flex items-center gap-2 text-gray-800 hover:text-gray-600 transition"
              >
                <Menu size={18} strokeWidth={2} />
                <span className="font-semibold text-sm">View All Top Rated</span>
              </button>
            </div>
            <h3 className="text-xl font-semibold mt-4 text-gray-900">Highest rated movies on FilmRate</h3>
          </div>
        </div>
      </section>

      {/* Popular Interest Popup */}
      {showPopularInterest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Phim nhiều rating nhất</h2>
              <button 
                onClick={() => setShowPopularInterest(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {mostRatedMovies.length === 0 ? (
                  <div className="col-span-3 text-center text-gray-500 py-8">
                    Chưa có phim
                  </div>
                ) : (
                  mostRatedMovies.map((movie) => (
                    <div 
                      key={movie._id}
                      onClick={() => {
                        setShowPopularInterest(false);
                        navigate(`/movie/${movie._id}`);
                      }}
                      className="cursor-pointer group"
                    >
                      <div className="aspect-[2/3] bg-gray-200 flex items-center justify-center mb-3 shadow-md group-hover:opacity-80 transition overflow-hidden">
                        {movie.posterUrl ? (
                          <img 
                            src={movie.posterUrl} 
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-300">
                            <svg width="100%" height="100%" viewBox="0 0 100 150" className="w-24 h-36">
                              <line x1="20" y1="30" x2="80" y2="120" stroke="currentColor" strokeWidth="8" />
                              <line x1="80" y1="30" x2="20" y2="120" stroke="currentColor" strokeWidth="8" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">{movie.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Star size={16} className="text-yellow-500" fill="#eab308" />
                        <span className="text-sm text-gray-600">{movie.averageRating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {movie.ratingCount || 0} lượt đánh giá
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Best Rated Popup */}
      {showBestRated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Highest Rated Movies</h2>
              <button 
                onClick={() => setShowBestRated(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {movies.length === 0 ? (
                  <div className="col-span-3 text-center text-gray-500 py-8">
                    No movies available
                  </div>
                ) : (
                  [...movies].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)).map((movie) => (
                    <div 
                      key={movie._id}
                      onClick={() => {
                        setShowBestRated(false);
                        navigate(`/movie/${movie._id}`);
                      }}
                      className="cursor-pointer group"
                    >
                      <div className="aspect-[2/3] bg-gray-200 flex items-center justify-center mb-3 shadow-md group-hover:opacity-80 transition overflow-hidden">
                        {movie.posterUrl ? (
                          <img 
                            src={movie.posterUrl} 
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-300">
                            <svg width="100%" height="100%" viewBox="0 0 100 150" className="w-24 h-36">
                              <line x1="20" y1="30" x2="80" y2="120" stroke="currentColor" strokeWidth="8" />
                              <line x1="80" y1="30" x2="20" y2="120" stroke="currentColor" strokeWidth="8" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">{movie.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Star size={16} className="text-yellow-500" fill="#eab308" />
                        <span className="text-sm text-gray-600">{movie.averageRating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}