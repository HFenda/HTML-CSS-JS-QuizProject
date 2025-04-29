"use strict";

const slides = document.querySelectorAll(".slide");
const btnLeft = document.querySelector(".slider__btn--left");
const btnRight = document.querySelector(".slider__btn--right");
let currSlide = 0;
const maxSlide = slides.length;

const dotContainer = document.querySelector(".dots");

const btnTake = document.querySelector(".take--btn");
const section = document.querySelector("section");

let correct = 0;
let incorrect = 0;

const createDots = function () {
  slides.forEach((_, i) => {
    dotContainer.insertAdjacentHTML(
      "beforeend",
      `<button class="dots__dot" data-slide="${i}"></button>`
    );
  });
};
createDots();

const activateDot = function (slide) {
  document
    .querySelectorAll(".dots__dot")
    .forEach((dot) => dot.classList.remove("dots__dot--active"));

  document
    .querySelector(`.dots__dot[data-slide="${slide}"]`)
    .classList.add("dots__dot--active");
};
activateDot(0);

slides.forEach((s, i) => (s.style.transform = `translateX(${i * 100}%)`));

const goToSlide = function (slide) {
  slides.forEach(
    (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`)
  );
};

const nextSlide = function () {
  if (currSlide === maxSlide - 1) {
    currSlide = 0;
  } else {
    currSlide++;
  }
  slides.forEach(
    (s, i) => (s.style.transform = `translateX(${(i - currSlide) * 100}%)`)
  );

  activateDot(currSlide);
};

const prevSlide = function () {
  if (currSlide === 0) {
    currSlide = maxSlide - 1;
  } else {
    currSlide--;
  }
  slides.forEach(
    (s, i) => (s.style.transform = `translateX(${(i - currSlide) * 100}%)`)
  );

  activateDot(currSlide);
};

btnRight.addEventListener("click", nextSlide);
btnLeft.addEventListener("click", prevSlide);

document.addEventListener("keydown", function (e) {
  if (e.key === "ArrowRight") {
    nextSlide();
  }
  if (e.key === "ArrowLeft") {
    prevSlide();
  }
});

dotContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("dots__dot")) {
    const { slide } = e.target.dataset;
    goToSlide(slide);
    activateDot(slide);
  }
});

btnTake.addEventListener("click", function (e) {
  e.preventDefault();
  const [coords] = section.getClientRects();
  window.scrollTo({ left: coords.left, top: coords.top, behavior: "smooth" });
});

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

const getQuestions = async function () {
  const response = await fetch("https://opentdb.com/api.php?amount=10");
  const questions = await response.json();
  const results = questions.results;
  const correct_answers = [];
  results.forEach((question, i) => {
    // Filter out undefined answers before shuffling
    const allAnswers = question.incorrect_answers.concat(question.correct_answer)
      .filter(answer => answer !== undefined && answer !== null && answer.trim() !== '');
    
    const answers = shuffleArray(allAnswers);
    correct_answers.push(question.correct_answer);

    // Only create buttons for defined answers
    const html = `<div class="question">
        <h2 style="display:flex; text-align:center">${question.question}</h2>
      </div>
      <div class="answers flex">
        <div class="row--1">
          ${answers[0] ? `<button class="answer">${answers[0]}</button>` : ''}
          ${answers[1] ? `<button class="answer">${answers[1]}</button>` : ''}
        </div>
        <div class="row--2">
          ${answers[2] ? `<button class="answer">${answers[2]}</button>` : ''}
          ${answers[3] ? `<button class="answer">${answers[3]}</button>` : ''}
        </div>
      </div>`;
      
    slides.forEach((slide, j) => {
      if (i === j) slide.insertAdjacentHTML("beforeend", html);
    });
  });

  const btnAnswers = document.querySelectorAll(".answer");

  btnAnswers.forEach((btn, n) => {
    btn.addEventListener("click", function () {
      // Get all answer buttons for this question
      const currentSlide = btn.closest('.slide');
      const allAnswers = currentSlide.querySelectorAll('.answer');
      
      // Mark the correct answer in green
      allAnswers.forEach(answerBtn => {
        if (correct_answers.some(correct => correct === answerBtn.textContent)) {
          answerBtn.style.background = "green";
        }
      });
      
      // Style the clicked button
      if (correct_answers.some(correct => correct === btn.textContent)) {
        correct++;
        btn.style.border = "3px solid darkgreen";
      } else {
        incorrect++;
        btn.style.background = "red";
        btn.style.border = "3px solid darkred";
      }

      if (n >= btnAnswers.length - 1) { // Last question
        setTimeout(() => {
          alert(`${correct}/10 correct answers!`);
          location.reload();
        }, 2000);
      }

      setTimeout(() => {
        slides.forEach((slide, i) => {
          if (currSlide === i) {
            slide.style = "filter : blur(1.5rem)";
          }
        });
        nextSlide();
      }, 1000);
    });
  });
};

getQuestions();
