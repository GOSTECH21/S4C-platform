interface PublishButtonProps {
  disabled: boolean;
  onPublish: () => void;
}

export default function PublishButton({
  disabled,
  onPublish,
}: PublishButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onPublish}
      className={`w-full rounded-xl py-4 text-xl font-bold transition ${
        disabled
          ? "cursor-not-allowed bg-slate-700 text-slate-400"
          : "bg-green-500 text-black hover:bg-green-400"
      }`}
    >
      Publish Match Portfolio
    </button>
  );
}