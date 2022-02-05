import { useLocation } from "react-router";
import { useQuery } from "react-query";
import styled from "styled-components";
import { motion, AnimatePresence, useViewportScroll } from "framer-motion";
import {
  getSearchMovie,
  getSearchTv,
  IGetMoviesResult,
  IGetTvsResult,
} from "../api";
import { makeImagePath } from "../utils";
import { useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";

const Wrapper = styled.div`
  background: black;
  padding-bottom: 200px;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Blank = styled.div`
  height: 50vh;
`;

const Slider = styled.div`
  position: relative;
  top: -100px;
`;

const TvSlider = styled.div`
  margin-top: 150px;
  margin-bottom: 50px;
  position: relative;
`;

const Row = styled(motion.div)`
  margin-top: 10px;
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
  background-color: white;
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center center;
  height: 200px;
  font-size: 66px;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Btn = styled.button`
  width: 50px;
  height: 200px;
  background-color: rgba(0, 0, 0, 0.5);
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.white.darker};
  right: 0;
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const BigMovie = styled(motion.div)`
  position: absolute;
  width: 40vw;
  height: 80vh;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.lighter};
`;

const BigCover = styled.div`
  width: 100%;
  background-size: cover;
  background-position: center center;
  height: 505px;
`;

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  font-size: 46px;
  position: relative;
  top: -80px;
`;

const BigInfo = styled.h2`
  padding-left: 20px;
  top: -80px;
  position: relative;
`;

const BigOverview = styled.p`
  padding: 20px;
  position: relative;
  top: -80px;
  color: ${(props) => props.theme.white.lighter};
`;

const rowVariants = {
  hidden: {
    x: window.outerWidth + 5,
  },
  visible: {
    x: 0,
  },
  exit: {
    x: -window.outerWidth - 5,
  },
};

const boxVariants = {
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.3,
    y: -80,
    transition: {
      delay: 0.5,
      duaration: 0.1,
      type: "tween",
    },
  },
};

const infoVariants = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.5,
      duaration: 0.1,
      type: "tween",
    },
  },
};

const offset = 6;

function Search() {
  const location = useLocation();
  const keyword: any = new URLSearchParams(location.search).get("keyword");
  const history = useHistory();
  const bigMovieMatch = useRouteMatch<{ movieId: string }>("/search/:movieId");
  const bigTvMatch = useRouteMatch<{ tvId: string }>("/search/:tvId");
  const { scrollY } = useViewportScroll();

  const { data: saerchData, isLoading: searchLoading } =
    useQuery<IGetMoviesResult>(["movies", "search"], () =>
      getSearchMovie(keyword)
    );

  const { data: saerchData1, isLoading: searchLoading1 } =
    useQuery<IGetTvsResult>(["tvs", "search1"], () => getSearchTv(keyword));

  const [index, setIndex] = useState(0);
  const [index1, setIndex1] = useState(0);

  const [leaving, setLeaving] = useState(false);

  const increaseIndex = () => {
    if (saerchData) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = saerchData.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const increaseIndex1 = () => {
    if (saerchData1) {
      if (leaving) return;
      toggleLeaving();
      const totalTvs = saerchData1.results.length - 1;
      const maxIndex = Math.floor(totalTvs / offset) - 1;
      setIndex1((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };

  const toggleLeaving = () => setLeaving((prev) => !prev);

  const onBoxClicked = (movieId: number) => {
    history.push(`/search/${movieId}`);
  };
  const onBoxClicked1 = (tvId: number) => {
    history.push(`/search/${tvId}`);
  };

  const onOverlayClick = () => {
    history.push("/search");
  };

  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    saerchData?.results.find(
      (movie) => movie.id === +bigMovieMatch.params.movieId
    );
  const clickedTv =
    bigTvMatch?.params.tvId &&
    saerchData1?.results.find((tv) => tv.id === +bigTvMatch.params.tvId);

  const isLoading = searchLoading || searchLoading1;

  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Blank />
          <Slider>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <h1>Movie</h1>
              <Row
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={index}
              >
                {saerchData?.results
                  .slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      key={movie.id}
                      whileHover="hover"
                      initial="normal"
                      variants={boxVariants}
                      onClick={() => onBoxClicked(movie.id)}
                      transition={{ type: "tween" }}
                      bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
                <Btn onClick={increaseIndex}>&rarr;</Btn>
              </Row>
            </AnimatePresence>
          </Slider>
          <TvSlider>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <h1>Tv</h1>
              <Row
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={index1}
              >
                {saerchData1?.results
                  .slice(1)
                  .slice(offset * index1, offset * index1 + offset)
                  .map((tv) => (
                    <Box
                      layoutId={tv.id + ""}
                      key={tv.id}
                      whileHover="hover"
                      initial="normal"
                      variants={boxVariants}
                      onClick={() => onBoxClicked1(tv.id)}
                      transition={{ type: "tween" }}
                      bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{tv.original_name}</h4>
                      </Info>
                    </Box>
                  ))}
                <Btn onClick={increaseIndex1}>&rarr;</Btn>
              </Row>
            </AnimatePresence>
          </TvSlider>
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <BigMovie
                  style={{ top: scrollY.get() + 100 }}
                  layoutId={bigMovieMatch.params.movieId}
                >
                  {clickedMovie && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                            clickedMovie.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedMovie.title}</BigTitle>
                      <BigInfo>
                        <div>Release Date: {clickedMovie.release_date}</div>
                        <div>Popularity: {clickedMovie.popularity}</div>
                      </BigInfo>
                      <BigOverview>{clickedMovie.overview}</BigOverview>
                    </>
                  )}

                  {clickedTv && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                            clickedTv.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedTv.original_name}</BigTitle>
                      <BigInfo>
                        <div>Release Date: {clickedTv.first_air_date}</div>
                        <div>Popularity: {clickedTv.popularity}</div>
                      </BigInfo>
                      <BigOverview>{clickedTv.overview}</BigOverview>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Search;
