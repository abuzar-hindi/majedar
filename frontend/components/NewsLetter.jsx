"use client";

const NewsLetter = () => {
  const onSubmitHandler = (event) => {
    event.preventDefault();
  };

  return (
    <div className="text-center">
      <p className="text-2xl font-medium text-gray-800">Tell us, if any complain or suggestions</p>
      <form onSubmit={onSubmitHandler} className="w-full sm:w-1/2 border pl-3 flex my-6 mx-auto items-center">
        <input
          className="w-full sm:flex-1 outline-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400"
          type="email"
          placeholder="Enter your query/message or complain here..."
          required
        />
        <button className="py-4 px-10 bg-black text-white rounded-md text-xs">Submit</button>
      </form>
    </div>
  );
};

export default NewsLetter;
