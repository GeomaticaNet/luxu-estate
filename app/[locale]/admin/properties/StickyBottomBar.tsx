"use client";

export function StickyBottomBar() {
  return (
    <div className="sticky bottom-0 z-50 bg-background-light/95 backdrop-blur-xl mt-8">
      <div className="bg-background-light rounded-b-[0.75rem] shadow-sm border border-gray-100 border-t-gray-300 h-16 flex items-center justify-end px-6">
        <div className="flex gap-3">
          <button
            type="submit"
            form="property-form"
            name="saveMode"
            value="draft"
            className="px-5 py-2.5 rounded-[0.5rem] border border-mosque/20 bg-white text-mosque hover:bg-white/80 transition-colors font-medium font-sf-pro text-sm"
          >
            Save Draft
          </button>
          <button
            type="submit"
            form="property-form"
            name="saveMode"
            value="publish"
            className="px-5 py-2.5 rounded-[0.5rem] bg-mosque hover:bg-nordic-dark text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-sf-pro text-sm"
          >
            <span className="material-icons text-sm">save</span>
            Save Property
          </button>
        </div>
      </div>
    </div>
  );
}
