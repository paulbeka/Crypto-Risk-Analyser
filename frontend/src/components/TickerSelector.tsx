import { useEffect, useRef, useState } from "react";
import { Autocomplete, TextField, CircularProgress, Box, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getTickerSuggestions } from "../api/Api";


interface TickerSelectorProps {
  onSelect: (crypto: string) => void;
}

export const TickerSelector: React.FC<TickerSelectorProps> = ({ onSelect }) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const requestIdRef = useRef(0);

  useEffect(() => {
    const q = inputValue.trim();

    if (q.length === 0) {
      setOptions([]);
      setOpen(false);
      return;
    }

    const myRequestId = ++requestIdRef.current;

    const debounce = setTimeout(async () => {
      setLoading(true);
      try {
        const coins: string[] = await getTickerSuggestions(q);
        setOptions(coins);
        setOpen(coins.length > 0);
      } catch (err) {
        console.error("Error fetching crypto:", err);
      } finally {
        if (requestIdRef.current === myRequestId) setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [inputValue]);

  return (
    <Autocomplete<string>
      sx={{ width: 400, backgroundColor: "white", borderRadius: 2 }}
      open={open}
      onOpen={() => {
        if (inputValue.trim().length > 0) setOpen(true);
      }}
      onClose={() => setOpen(false)}
      options={options}
      loading={loading}
      filterOptions={(x) => x} 
      getOptionLabel={(option) => option ?? ""}
      isOptionEqualToValue={(option, value) => option === value}
      inputValue={inputValue}
      onInputChange={(_, newInputValue, reason) => {
        if (reason === "input") {
          setInputValue(newInputValue);
          if (newInputValue.trim().length > 0) setOpen(true);
        }
        if (reason === "clear") {
          setInputValue("");
          setOpen(false);
        }
      }}
      onChange={(_, value) => {
        if (value) onSelect(value);
      }}
      clearOnBlur={false}
      includeInputInList
      autoComplete
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Crypto"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option}>
          {option}
        </Box>
      )}
    />
  );
};